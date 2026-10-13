// Bundles the CLI and its Ink terminal UI. Next handles all MDX rendering, CSS and images.

import * as esbuild from 'esbuild'
import { dirname, resolve } from 'node:path'
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

await esbuild.build({
  entryPoints: [resolve(root, 'src/cli/main.ts')],
  outfile: resolve(root, 'dist/cli.mjs'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22.12',
  packages: 'external',
  jsx: 'automatic',
  plugins: [tsconfigPaths],
  logLevel: 'info',
})
