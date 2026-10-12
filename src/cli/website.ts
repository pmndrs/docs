import { stageLocalMdx } from './local-mdx'
import { existsSync } from 'node:fs'
import { cp, mkdir, mkdtemp, realpath, rm, rmdir, symlink } from 'node:fs/promises'
import { dirname, join, parse, sep } from 'node:path'

/**
 * What the Next app is made of — the `files` this package publishes, minus the ones a static
 * export has no use for. Missing entries are skipped: `files` is a superset, and not every
 * version of this package has every one of them.
 */
const APP_FILES = [
  'package.json',
  'dist',
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

/** The folder the app is copied to and built in, removed once the export is out. */
const WORK_DIR = '.pmndrs-docs'

/** The installed engine's dependency directory, including pnpm's package-local links. */
function findDependencies(packageRoot: string) {
  for (let dir = packageRoot; ; dir = dirname(dir)) {
    if (existsSync(join(dir, 'node_modules', 'next'))) return join(dir, 'node_modules')
    if (dirname(dir) === dir) return null
  }
}

/** An app under any node_modules ancestor is treated as dependency source by Turbopack. */
function buildRootFor(dependencies: string) {
  const parts = dependencies.split(sep)
  const nodeModules = parts.indexOf('node_modules')
  return nodeModules < 0
    ? dirname(dependencies)
    : parts.slice(0, nodeModules).join(sep) || parse(dependencies).root
}

/** A finishing sibling may remove the empty parent between mkdir and mkdtemp. */
async function createWorkDirectory(parent: string): Promise<string> {
  for (;;) {
    await mkdir(parent, { recursive: true })
    try {
      return await mkdtemp(join(parent, 'build-'))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }
  }
}

/**
 * What the copy leaves behind, mirroring the `!` entries of `files`: Route Handlers cannot be
 * statically exported, nor the `/mcp/live` page that streams from one of its own; and tests and
 * stories are not part of the app — they reach for `.storybook` and `vitest`, which the app has no
 * reason to carry.
 */
const isExcluded = (path: string) =>
  /\.(test|stories)\.[jt]sx?$/.test(path) ||
  path.endsWith('src/app/api') ||
  path.endsWith('src/app/mcp/live') ||
  path.endsWith('src/stories')

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
  const dependencies = findDependencies(packageRoot)
  if (!dependencies) throw new Error('Cannot find the `next` package to build the website with')
  const buildRoot = buildRootFor(dependencies)
  const workParent = join(buildRoot, WORK_DIR)
  const workDir = await createWorkDirectory(workParent)

  const basePath = env.BASE_PATH ?? ''
  const distDir = `out${basePath}`

  // The Next config and the app read these at module scope, so they must be set before the
  // build is imported. Undefined values are dropped rather than assigned: `process.env`
  // stringifies whatever it is given, and the app would read the literal "undefined".
  const environment: Record<string, string> = {
    BASE_PATH: basePath,
    DIST_DIR: distDir,
    OUTPUT: 'export',
    NODE_ENV: 'production',
    PMNDRS_DOCS_BUILD_ROOT: buildRoot,
  }
  for (const [name, value] of Object.entries(env)) {
    if (value !== undefined) environment[name] ??= value
  }
  Object.assign(process.env, environment)

  try {
    await symlink(await realpath(dependencies), join(workDir, 'node_modules'), 'dir')
    await Promise.all(
      APP_FILES.filter((path) => existsSync(join(packageRoot, path))).map((path) =>
        cp(join(packageRoot, path), join(workDir, path), {
          recursive: true,
          filter: (source) => !isExcluded(source),
        }),
      ),
    )

    // The docs move in with the app, at the path `globals.css` names in its `@source`. That
    // declaration has to be static — Tailwind resolves it at build time, against the
    // stylesheet — so the folder comes to the path rather than the path to the folder.
    if (environment.MDX) {
      const staged = join(workDir, MDX_DIR)
      await cp(environment.MDX, staged, { recursive: true })
      // Absolute: the app resolves a relative one against the working directory, which is the
      // caller's, not this copy.
      process.env.MDX = await stageLocalMdx(environment.MDX, workDir)
    }

    // `next` has no public build API. `nextBuild` takes an options object, where the `build`
    // it wraps takes a dozen positional arguments whose order moves between majors — so this
    // is the entry point that survives a Next upgrade best.
    const { nextBuild } = await import('next/dist/cli/next-build.js')
    await nextBuild(
      { mangling: true, experimentalDebugMemoryUsage: false, experimentalBuildMode: 'default' },
      workDir,
    )

    // Each page's markdown is exported under `md/` (`src/app/md/[...slug]/route.ts`), but
    // belongs beside the page, at `<path>.md`: the URL a server build rewrites to it.
    const exportDir = join(workDir, distDir)
    const markdownDir = join(exportDir, 'md')
    // Without `ICON`, `/icon.svg` (`src/app/icon.svg/route.ts`) is a 404, but the export writes
    // its body all the same: left out, so the file is missing rather than a broken image.
    const iconFile = join(exportDir, 'icon.svg')
    const isLeftOut = (source: string) =>
      source === markdownDir || (!environment.ICON && source === iconFile)
    await mkdir(outDir, { recursive: true })
    await cp(exportDir, outDir, { recursive: true, filter: (source) => !isLeftOut(source) })
    if (existsSync(markdownDir)) await cp(markdownDir, outDir, { recursive: true })
  } finally {
    await rm(workDir, { recursive: true, force: true })
    // A concurrent build may still own a sibling. Only remove the now-empty parent.
    await rmdir(workParent).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOTEMPTY' && error.code !== 'ENOENT') throw error
    })
  }
}
