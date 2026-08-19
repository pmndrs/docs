import { existsSync } from 'node:fs'
import { cp, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

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
  workDir,
  env,
}: {
  packageRoot: string
  outDir: string
  workDir: string
  env: Record<string, string | undefined>
}) {
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
  }
  for (const [name, value] of Object.entries(env)) {
    if (value !== undefined) environment[name] ??= value
  }
  Object.assign(process.env, environment)

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

  // The docs move in with the app, at the path `globals.css` names in its `@source`. That
  // declaration has to be static — Tailwind resolves it at build time, against the
  // stylesheet — so the folder comes to the path rather than the path to the folder.
  if (environment.MDX) {
    const staged = join(workDir, MDX_DIR)
    await cp(environment.MDX, staged, { recursive: true })
    // Absolute: the app resolves a relative one against the working directory, which is the
    // caller's, not this copy.
    process.env.MDX = staged
  }

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
