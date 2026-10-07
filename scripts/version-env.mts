// The version switcher's `NEXT_PUBLIC_VERSION_*` variables, for a build that has no git: written
// as `key=value` lines, for `$GITHUB_OUTPUT`.
//
// The CLI resolves them itself, in the caller's checkout. docs.pmnd.rs is not built by the CLI but
// by Vercel, from sources `vercel deploy` uploads without `.git` -- no tags, no remote. So CI,
// which has the checkout, resolves them here, with the very function the CLI calls, and hands
// them down as build env. `next.config.mjs` then finds them set and asks nothing more.
//
// Run with Node's type stripping: `node scripts/version-env.mts >> "$GITHUB_OUTPUT"`.
// Reads the website configuration from the environment, like the CLI does: `LIB_VERSION`,
// `TAG_MATCH`, `VERSION_URL_TEMPLATE`, `VERSION_PRODUCTION_BRANCH`, `VERSION_PRODUCTION_URL`
// (else `NEXT_PUBLIC_URL`), `VERSION_BRANCHES`, `VERSION_BRANCHES_LIST` -- and the CI's own
// `GITHUB_*` variables, through git-info.
//
// Outputs: the six `NEXT_PUBLIC_VERSION_*` variables, plus `slug`, the generic slug of the branch
// being built -- what `{branch}` expands to in `VERSION_URL_TEMPLATE`. With a URL template, it
// also requests each offered branch's URL, to offer only the ones with a deployment behind it.
//
// Each value must stay on one line, or `$GITHUB_OUTPUT` would read the rest as other keys. They
// do: `NEXT_PUBLIC_VERSION_BRANCHES` is compact JSON, and git names hold no newline.

import * as git from '../src/cli/git-info.ts'
import { resolveVersionEnv } from '../src/cli/version-env.ts'
import {
  assertValidUrlTemplate,
  expandUrlTemplate,
  slugifyBranch,
} from '../src/utils/slugify-branch.ts'

/** Longest DNS label allowed (RFC 1035). */
const MAX_LABEL_LENGTH = 63

const versionEnv = resolveVersionEnv(process.env, { git, assertValidUrlTemplate })

// Here, a branch's deployment exists only once CI has aliased it to the template's URL. So the
// switcher only offers the branches that can have one: not a branch whose hostname would have a
// label too long for DNS, and not two branches whose slugs collide -- they would fight over one
// alias. The production branch is always kept: it is served at the production URL, not the
// template's.
//
// Nor a branch that has nothing at its URL yet: a pull request whose CI has not run since the
// alias step existed leads to a 404. Each URL is asked once, in parallel. Only a 404 or a failed
// request drops a branch, not any other status: Vercel answers 404 for an alias it does not know,
// while a protected deployment answers 401 or 403 -- and does exist. The branch being built is
// kept unasked: its deployment is the one being made, aliased right after.
const template = versionEnv.NEXT_PUBLIC_VERSION_URL_TEMPLATE
if (template) {
  const productionBranch = versionEnv.NEXT_PUBLIC_VERSION_PRODUCTION_BRANCH
  const currentBranch = versionEnv.NEXT_PUBLIC_VERSION_BRANCH
  const branches: string[] = JSON.parse(versionEnv.NEXT_PUBLIC_VERSION_BRANCHES)

  const branchCountBySlug = new Map<string, number>()
  for (const branch of branches) {
    const slug = slugifyBranch(branch)
    branchCountBySlug.set(slug, (branchCountBySlug.get(slug) ?? 0) + 1)
  }

  const isDeployed = async (url: string) => {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'manual',
        signal: AbortSignal.timeout(10_000),
      })
      return response.status !== 404
    } catch {
      return false
    }
  }

  const keep = await Promise.all(
    branches.map(async (branch) => {
      if (branch === productionBranch) return true

      const url = await expandUrlTemplate(template, branch)
      const hostname = new URL(url).hostname
      const fitsInDns = hostname.split('.').every((label) => label.length <= MAX_LABEL_LENGTH)
      const hasOwnSlug = branchCountBySlug.get(slugifyBranch(branch)) === 1
      if (!fitsInDns || !hasOwnSlug) return false

      if (branch === currentBranch) return true
      return isDeployed(url)
    }),
  )
  versionEnv.NEXT_PUBLIC_VERSION_BRANCHES = JSON.stringify(branches.filter((_, i) => keep[i]))
}

for (const [key, value] of Object.entries(versionEnv)) {
  console.log(`${key}=${value}`)
}
console.log(`slug=${slugifyBranch(versionEnv.NEXT_PUBLIC_VERSION_BRANCH)}`)
