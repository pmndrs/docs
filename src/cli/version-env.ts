// What the sidebar's version switcher is told at build time, as `NEXT_PUBLIC_VERSION_*` variables.
//
// Resolved in exactly one place, here, and called from two: the CLI, in the library's checkout,
// before it builds; and `next.config.mjs`, for `next dev` / `next build` run without the CLI.
//
// This file must stay loadable by Node's own type stripping, since `next.config.mjs` imports it
// as is: erasable syntax only, and no runtime import of another `.ts` file (Node would need its
// extension, which TypeScript refuses here) -- hence git, and the URL template check, being
// handed in rather than imported. The app imports it too, for `DEFAULT_PRODUCTION_BRANCH`: one
// more reason to keep it free of runtime imports.

import type * as gitInfo from './git-info'
import type * as slugifyBranch from '../utils/slugify-branch'

/** The environment variables read here; a plain record, so tests can pass one. */
type Env = Record<string, string | undefined>

/** The git queries this needs, as `./git-info` exports them -- or as a test fakes them. */
export type Git = Pick<typeof gitInfo, 'getVersion' | 'getCurrentBranch' | 'getBranches'>

/** Throws on a URL template the switcher could not expand, as `../utils/slugify-branch` exports it. */
export type AssertValidUrlTemplate = typeof slugifyBranch.assertValidUrlTemplate

/** The branch the root URL (`NEXT_PUBLIC_URL`) serves, unless told otherwise. */
export const DEFAULT_PRODUCTION_BRANCH = 'main'

/** The variables the app reads. All strings, all always present -- empty meaning unknown. */
export type VersionEnv = {
  /** `v10.7.9`, `v10.7.9-3-ga1b2c3d`, `main@a1b2c3d`… */
  NEXT_PUBLIC_VERSION_LABEL: string
  /** The branch this build is of. */
  NEXT_PUBLIC_VERSION_BRANCH: string
  /** Where another branch's deployment lives, `{branch}` standing for its slug. Empty: no switcher. */
  NEXT_PUBLIC_VERSION_URL_TEMPLATE: string
  /** The branch `NEXT_PUBLIC_URL` serves. */
  NEXT_PUBLIC_VERSION_PRODUCTION_BRANCH: string
  /** The branches to offer, as a JSON array: the production one first, the rest sorted. */
  NEXT_PUBLIC_VERSION_BRANCHES: string
}

/** The keys of {@link VersionEnv}, for whoever fills in only the ones still missing. */
export const VERSION_ENV_KEYS: readonly (keyof VersionEnv)[] = [
  'NEXT_PUBLIC_VERSION_LABEL',
  'NEXT_PUBLIC_VERSION_BRANCH',
  'NEXT_PUBLIC_VERSION_URL_TEMPLATE',
  'NEXT_PUBLIC_VERSION_PRODUCTION_BRANCH',
  'NEXT_PUBLIC_VERSION_BRANCHES',
]

/**
 * Resolves the version switcher's variables from the website configuration (`LIB_VERSION`,
 * `TAG_MATCH`, `VERSION_URL_TEMPLATE`, `VERSION_PRODUCTION_BRANCH`, `VERSION_BRANCHES`,
 * `VERSION_BRANCHES_LIST`) and from git, asked in `cwd`.
 *
 * - The label is `LIB_VERSION` when given -- git is then not even asked -- or `git describe`.
 * - Without a URL template there is no switcher, so the branches are not listed: that is a
 *   network call (`git ls-remote`) nobody would see the result of.
 * - With one, the production branch and the current branch are always offered, whether or not
 *   the remote (or `VERSION_BRANCHES_LIST`) has them: one is where the switcher leads back to,
 *   the other is where the reader already is.
 *
 * Git knowing nothing is fine, the switcher just shows less. A broken configuration is not:
 * an invalid `VERSION_BRANCHES` regex or an unknown `{branch:<preset>}` in the template throws,
 * so that the build fails instead of quietly shipping a switcher that cannot work.
 */
export function resolveVersionEnv(
  env: Env,
  {
    cwd,
    git,
    assertValidUrlTemplate,
  }: { cwd?: string; git: Git; assertValidUrlTemplate: AssertValidUrlTemplate },
): VersionEnv {
  const template = env.VERSION_URL_TEMPLATE || ''
  const include = env.VERSION_BRANCHES || undefined
  if (template) assertValidUrlTemplate(template)
  if (include) assertValidRegex('VERSION_BRANCHES', include)

  const productionBranch = env.VERSION_PRODUCTION_BRANCH || DEFAULT_PRODUCTION_BRANCH
  const branch = git.getCurrentBranch({ cwd }) ?? ''
  const label =
    env.LIB_VERSION || git.getVersion({ cwd, tagMatch: env.TAG_MATCH || undefined }) || ''

  let branches: string[] = []
  if (template) {
    const listed = git.getBranches({
      cwd,
      include,
      list: env.VERSION_BRANCHES_LIST || undefined,
    })
    // The one place the list is ordered: the production branch first, then the others sorted,
    // each once.
    const others = new Set([...listed, branch])
    others.delete(productionBranch)
    others.delete('')
    branches = [productionBranch, ...[...others].sort()]
  }

  return {
    NEXT_PUBLIC_VERSION_LABEL: label,
    NEXT_PUBLIC_VERSION_BRANCH: branch,
    NEXT_PUBLIC_VERSION_URL_TEMPLATE: template,
    NEXT_PUBLIC_VERSION_PRODUCTION_BRANCH: productionBranch,
    NEXT_PUBLIC_VERSION_BRANCHES: JSON.stringify(branches),
  }
}

function assertValidRegex(name: string, source: string): void {
  try {
    new RegExp(source)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`${name} is not a valid regular expression ("${source}"): ${reason}`)
  }
}
