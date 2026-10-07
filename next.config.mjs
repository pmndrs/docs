import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { VERSION_ENV_KEYS } from './src/cli/version-env-keys.js'

/**
 * Resolves the version switcher's `NEXT_PUBLIC_VERSION_*` variables for `next dev`, or for
 * `next build` run directly.
 *
 * One rule: a `NEXT_PUBLIC_VERSION_*` variable that is already defined -- even empty -- is kept,
 * and only the undefined ones are filled in. Under the CLI they are all defined already (it asks
 * git in the library's checkout, while this file runs in a copy of the package), and so they are
 * in this repo's CI, which hands them to Vercel as build env: git is then not asked at all.
 *
 * Written to `process.env`, like the CLI does, rather than to `env`: one way in for both, and
 * the processes Next spawns inherit them instead of asking git again.
 *
 * Which keys are missing is decided first, from a plain `.js` list, so that a build with none
 * missing never imports TypeScript. The TypeScript is otherwise imported as is, which Node's type
 * stripping allows (Node >= 22.18, see .nvmrc). Anywhere it does not, the site simply builds
 * without a version label -- and that is the only failure swallowed here: git being unavailable
 * already degrades inside git-info, while a broken configuration (an invalid `VERSION_BRANCHES`,
 * an unknown `{branch:<preset>}`) throws from `resolveVersionEnv` and fails the build, as it does
 * under the CLI.
 */
async function resolveVersionEnvIfAbsent() {
  const missing = VERSION_ENV_KEYS.filter((key) => process.env[key] === undefined)
  if (missing.length === 0) return

  let git, versionEnv, slugifyBranch
  try {
    git = await import('./src/cli/git-info.ts')
    versionEnv = await import('./src/cli/version-env.ts')
    slugifyBranch = await import('./src/utils/slugify-branch.ts')
  } catch (error) {
    console.warn('Version label unavailable:', error instanceof Error ? error.message : error)
    return
  }

  const cwd = dirname(fileURLToPath(import.meta.url))
  const resolved = versionEnv.resolveVersionEnv(process.env, {
    cwd,
    git,
    assertValidUrlTemplate: slugifyBranch.assertValidUrlTemplate,
  })
  for (const key of missing) {
    process.env[key] = resolved[key]
  }
}
await resolveVersionEnvIfAbsent()

const basePath = process.env.BASE_PATH || ''
const distDir = process.env.DIST_DIR || undefined
const output = process.env.OUTPUT || undefined

/**
 * Each page's markdown at the page's own URL plus `.md`, e.g. `/getting-started/introduction.md`.
 *
 * It is served by `src/app/md/[...slug]/route.ts`, under `/md` because a route handler cannot
 * sit beside `[...slug]/page.tsx`. A default (`afterFiles`) rewrite is checked before dynamic
 * routes, so the `[...slug]` catch-all never sees these paths.
 *
 * Server only: a static export has no rewrites (Next warns about them), and `next-build.sh` and
 * the CLI move the exported files to the same URLs instead.
 */
async function rewrites() {
  return [
    {
      source: '/:path+.md',
      destination: '/md/:path+.md',
    },
  ]
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  images: {
    // domains: ['codesandbox.io'],
    unoptimized: true,
  },
  basePath,
  distDir,
  output,
  rewrites: output === 'export' ? undefined : rewrites,
  async redirects() {
    return [
      // Where the markdown of a page was first published. Redirects only apply to the request
      // as it comes in, never to the destination of a rewrite, so this does not loop with the
      // rewrite above, which still serves the markdown from `/md`.
      {
        source: '/md/:path+.md',
        destination: '/:path+.md',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/docs/:slug*',
        destination: '/:slug*',
        permanent: true,
      },
      //
      {
        source: '/xr',
        destination: '/xr/getting-started/introduction',
        permanent: true,
      },
      {
        source: '/jotai',
        destination: 'https://jotai.pmnd.rs/docs/introduction',
        permanent: true,
      },
      {
        source: '/jotai/:slug*',
        destination: 'https://jotai.pmnd.rs/docs/:slug*',
        permanent: true,
      },
      {
        source: '/react-spring',
        destination: 'https://react-spring.io',
        permanent: true,
      },
      {
        source: '/react-spring/:slug*',
        destination: 'https://react-spring.io/#:slug*',
        permanent: true,
      },
      {
        source: '/drei',
        destination: 'https://pmndrs.github.io/drei',
        permanent: true,
      },
      {
        source: '/drei/:slug*',
        destination: 'https://github.com/pmndrs/drei#:slug*',
        permanent: true,
      },
      //
      {
        source: '/react-three-fiber/:slug*',
        destination: 'https://pmndrs.github.io/react-three-fiber/:slug*',
        permanent: true,
      },
      {
        source: '/zustand/:slug*',
        destination: 'https://pmndrs.github.io/zustand/:slug*',
        permanent: true,
      },
      {
        source: '/a11y/:slug*',
        destination: 'https://pmndrs.github.io/react-three-a11y/:slug*',
        permanent: true,
      },
      {
        source: '/react-postprocessing/:slug*',
        destination: 'https://pmndrs.github.io/react-postprocessing/:slug*',
        permanent: true,
      },
      {
        source: '/uikit/:slug*',
        destination: 'https://pmndrs.github.io/uikit/docs/:slug*',
        permanent: true,
      },
      {
        source: '/xr/:slug*',
        destination: 'https://pmndrs.github.io/xr/docs/:slug*',
        permanent: true,
      },
    ]
  },
}
// console.log('nextConfig=', nextConfig)

export default nextConfig
