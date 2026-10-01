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
// `TAG_MATCH`, `VERSION_URL_TEMPLATE`, `VERSION_PRODUCTION_BRANCH`, `VERSION_BRANCHES`,
// `VERSION_BRANCHES_LIST`.
//
// Outputs: the five `NEXT_PUBLIC_VERSION_*` variables, plus `slug`, the generic slug of the branch
// being built -- what `{branch}` expands to in `VERSION_URL_TEMPLATE`.
//
// Each value must stay on one line, or `$GITHUB_OUTPUT` would read the rest as other keys. They
// do: `NEXT_PUBLIC_VERSION_BRANCHES` is compact JSON, and git names hold no newline.

import * as git from '../src/cli/git-info.ts'
import { resolveVersionEnv } from '../src/cli/version-env.ts'
import { assertValidUrlTemplate, slugifyBranch } from '../src/utils/slugify-branch.ts'

const versionEnv = resolveVersionEnv(process.env, { git, assertValidUrlTemplate })

for (const [key, value] of Object.entries(versionEnv)) {
  console.log(`${key}=${value}`)
}
console.log(`slug=${slugifyBranch(versionEnv.NEXT_PUBLIC_VERSION_BRANCH)}`)
