// Bundles the CLI so that `node` can run what only Next could run: TSX, the `@/` paths of
// tsconfig, and the CSS and image imports our components make.

import * as esbuild from 'esbuild'
import sizeOf from 'image-size'
import { readFile } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * The `paths` of tsconfig.json: `@/*` resolves under `src/`, and `@/registry/*` at the repo
 * root, where `shadcn` looks for registry items.
 */
const tsconfigPaths = {
  name: 'tsconfig-paths',
  setup(build) {
    build.onResolve({ filter: /^@\// }, async (args) => {
      const path = args.path.slice('@/'.length)
      const absolute =
        path === 'package.json' || path.startsWith('registry/')
          ? resolve(root, path)
          : resolve(root, 'src', path)

      return build.resolve(absolute, { kind: args.kind, resolveDir: dirname(absolute) })
    })
  },
}

/** Stylesheets are the website's business; a fragment carries none. */
const stylesheets = {
  name: 'stylesheets',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, () => ({ contents: '', loader: 'js' }))
  },
}

const MIME = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
}

/**
 * Static image imports, in the shape Next gives them — `{ src, width, height }` — so that
 * components need not know which of the two compiled them. `src` is a data URI, since a
 * fragment travels alone.
 */
const staticImages = {
  name: 'static-images',
  setup(build) {
    build.onLoad({ filter: /\.(svg|png|jpe?g|gif|webp|avif)$/ }, async (args) => {
      const data = await readFile(args.path)
      const { width, height } = sizeOf(data)
      const src = `data:${MIME[extname(args.path)]};base64,${data.toString('base64')}`

      return {
        contents: `export default ${JSON.stringify({ src, width, height })}`,
        loader: 'js',
      }
    })
  },
}

await esbuild.build({
  entryPoints: [resolve(root, 'src/cli/main.ts')],
  outfile: resolve(root, 'dist/cli.mjs'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20.9',
  packages: 'external',
  jsx: 'automatic',
  plugins: [tsconfigPaths, stylesheets, staticImages],
  logLevel: 'info',
})
