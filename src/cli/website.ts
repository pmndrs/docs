import { existsSync, rmSync, unlinkSync } from 'node:fs'
import { cp, mkdir, rm, symlink, unlink } from 'node:fs/promises'
import { dirname, join, sep } from 'node:path'

/**
 * What the Next app is made of — the `files` this package publishes, minus the ones a static
 * export has no use for. Missing entries are skipped: `files` is a superset, and not every
 * version of this package has every one of them.
 */
const APP_FILES = [
  'package.json',
  'next.config.mjs',
  'next-env.d.ts',
  'postcss.config.mjs',
  'tsconfig.json',
  'public',
  'registry',
  'src',
]

/** Where the docs are staged inside the copy. `src/app/globals.css` names it too. */
const MDX_DIR = 'docs'

/** Where they are served from, under `public`. Not `docs`: `next.config.mjs` redirects that. */
const SERVED_DIR = 'mdx'

/** The folder the app is copied to and built in, removed once the export is out. */
const WORK_DIR = '.pmndrs-docs'

/**
 * Where to build the copy: beside the `node_modules` holding this package's own dependencies.
 *
 * Next has to be resolvable from wherever it is built, and Node finds it by walking up — so
 * building in the caller's folder only works when the caller happens to have Next installed
 * too, which `npx` does not. Symlinking the dependencies in instead is not an option either:
 * Turbopack rejects a link that leaves its project root. So the copy goes where the
 * dependencies already are, whether a package manager nested them beside this package or
 * hoisted them above it.
 */
function findWorkDir(packageRoot: string) {
  for (let dir = packageRoot; ; dir = dirname(dir)) {
    if (existsSync(join(dir, 'node_modules', 'next'))) return join(dir, WORK_DIR)
    if (dirname(dir) === dir) return null
  }
}

/**
 * What the copy leaves behind, mirroring the `!` entries of `files`: Route Handlers cannot be
 * statically exported, and tests and stories are not part of the app — they reach for
 * `.storybook` and `vitest`, which the app has no reason to carry.
 */
const isExcluded = (path: string) =>
  /\.(test|stories)\.[jt]sx?$/.test(path) ||
  path.endsWith('src/app/api') ||
  path.endsWith('src/stories')

/**
 * Copies the app out of this package, into a folder Turbopack accepts as a project root, and
 * links the documentation in at the path `globals.css` names in its `@source` -- that
 * declaration is resolved statically, against the stylesheet, so the docs have to come to the
 * path rather than the path to the docs. Nothing reads them through the link but Tailwind: a
 * link is not a folder to `lstat`, which is how the pages themselves are found.
 */
async function stageApp(packageRoot: string, mdx?: string) {
  const workDir = findWorkDir(packageRoot)
  if (!workDir) throw new Error('Cannot find the `next` package to run the website with')

  await rm(workDir, { recursive: true, force: true })
  await mkdir(workDir, { recursive: true })
  await Promise.all(
    APP_FILES.filter((path) => existsSync(join(packageRoot, path))).map((path) =>
      cp(join(packageRoot, path), join(workDir, path), {
        recursive: true,
        filter: (source) => !isExcluded(source),
      }),
    ),
  )
  if (mdx) await symlink(mdx, join(workDir, MDX_DIR))

  return workDir
}

/**
 * Whether this package is an installed dependency, rather than the checkout it was cloned as.
 *
 * Only the installed one has to be copied elsewhere to run: Turbopack refuses a project rooted
 * under `node_modules`. A checkout runs where it is, which is also what keeps its own `src/`
 * hot-reloading while someone works on it.
 */
const isInstalled = (packageRoot: string) => packageRoot.split(sep).includes('node_modules')

/** Sets what the Next config and the app read at module scope, before either is imported. */
function applyEnv(environment: Record<string, string>, env: Record<string, string | undefined>) {
  // Undefined values are dropped rather than assigned: `process.env` stringifies whatever it is
  // given, and the app would read the literal "undefined".
  for (const [name, value] of Object.entries(env)) {
    if (value !== undefined) environment[name] ??= value
  }
  Object.assign(process.env, environment)
}

/**
 * Statically exports the documentation website.
 *
 * The app is copied out of this package before being built, because Turbopack refuses to
 * process a project rooted under `node_modules` — which is exactly where an installed package
 * lives. The copy doubles as the way `/api` is kept out of the export: it is simply not
 * copied, so nothing has to be moved out of the way and put back.
 *
 * @param env - Website configuration, as the environment variables the app reads
 *   (`MDX`, `NEXT_PUBLIC_LIBNAME`, `BASE_PATH`, `ICON`, `THEME_*`…)
 */
export async function buildWebsite({
  packageRoot,
  outDir,
  env,
}: {
  packageRoot: string
  outDir: string
  env: Record<string, string | undefined>
}) {
  const basePath = env.BASE_PATH ?? ''
  const distDir = `out${basePath}`

  applyEnv(
    { BASE_PATH: basePath, DIST_DIR: distDir, OUTPUT: 'export', NODE_ENV: 'production' },
    env,
  )

  // The docs are read where they are, absolute: only Tailwind needs them under the copy
  const workDir = await stageApp(packageRoot, process.env.MDX)

  try {
    // `next` has no public build API. `nextBuild` takes an options object, where the `build`
    // it wraps takes a dozen positional arguments whose order moves between majors — so this
    // is the entry point that survives a Next upgrade best.
    const { nextBuild } = await import('next/dist/cli/next-build.js')
    await nextBuild(
      { mangling: true, experimentalDebugMemoryUsage: false, experimentalBuildMode: 'default' },
      workDir,
    )

    await mkdir(outDir, { recursive: true })
    await cp(join(workDir, distDir), outDir, { recursive: true })
  } finally {
    await rm(workDir, { recursive: true, force: true })
  }
}
/**
 * Serves the documentation website, rebuilding a page whenever it changes.
 *
 * The docs are linked in rather than staged, twice: where `@source` looks for the classes an MDX
 * file writes, and under `public`, which is where Next serves a folder as it is on disk. That
 * second one is what answers `MDX_BASEURL`, so an image dropped beside a page is one reload
 * away and there is no second server to start.
 *
 * @param env - Website configuration, as the environment variables the app reads
 *   (`MDX`, `NEXT_PUBLIC_LIBNAME`, `BASE_PATH`, `ICON`, `THEME_*`…)
 */
export async function devWebsite({
  packageRoot,
  port,
  env,
}: {
  packageRoot: string
  port: number
  env: Record<string, string | undefined>
}) {
  const basePath = env.BASE_PATH ?? ''

  // `OUTPUT` is emptied rather than left alone: a static export has no development server, and
  // the variable may well still be exported from a shell that built the site earlier.
  applyEnv(
    {
      BASE_PATH: basePath,
      OUTPUT: '',
      MDX_BASEURL: `${basePath}/${SERVED_DIR}`,
    },
    env,
  )

  // A checkout runs where it is; only an installed package has to be copied out of node_modules
  const dir = isInstalled(packageRoot) ? await stageApp(packageRoot, process.env.MDX) : packageRoot
  const served = join(dir, 'public', SERVED_DIR)
  await unlink(served).catch(() => {}) // a crashed run leaves its link behind
  if (process.env.MDX) await symlink(process.env.MDX, served)

  // Link and copy are ours, not the developer's: they go when the server does — Next stops its
  // own child on a signal and exits, which is what gets us here. `unlink` rather than `rm`,
  // which follows a link to a folder and then refuses to remove a folder.
  process.on('exit', () => {
    try {
      unlinkSync(served)
    } catch {
      // Never created, or already gone
    }
    if (dir !== packageRoot) rmSync(dir, { recursive: true, force: true })
  })
  const { nextDev } = await import('next/dist/cli/next-dev.js')
  await nextDev({ port, disableSourceMaps: false }, 'default', dir)
}
