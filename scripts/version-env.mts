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
// being built -- what `{branch}` expands to in `VERSION_URL_TEMPLATE`.
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
const template = versionEnv.NEXT_PUBLIC_VERSION_URL_TEMPLATE
if (template) {
  const productionBranch = versionEnv.NEXT_PUBLIC_VERSION_PRODUCTION_BRANCH
  const branches: string[] = JSON.parse(versionEnv.NEXT_PUBLIC_VERSION_BRANCHES)

  const branchCountBySlug = new Map<string, number>()
  for (const branch of branches) {
    const slug = slugifyBranch(branch)
    branchCountBySlug.set(slug, (branchCountBySlug.get(slug) ?? 0) + 1)
  }

  const deployable: string[] = []
  for (const branch of branches) {
    if (branch === productionBranch) {
      deployable.push(branch)
      continue
    }

    const hostname = new URL(await expandUrlTemplate(template, branch)).hostname
    const fitsInDns = hostname.split('.').every((label) => label.length <= MAX_LABEL_LENGTH)
    const hasOwnSlug = branchCountBySlug.get(slugifyBranch(branch)) === 1
    if (fitsInDns && hasOwnSlug) deployable.push(branch)
  }
  versionEnv.NEXT_PUBLIC_VERSION_BRANCHES = JSON.stringify(deployable)
}

for (const [key, value] of Object.entries(versionEnv)) {
  console.log(`${key}=${value}`)
}
console.log(`slug=${slugifyBranch(versionEnv.NEXT_PUBLIC_VERSION_BRANCH)}`)
