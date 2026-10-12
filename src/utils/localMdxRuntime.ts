import { build } from 'esbuild'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { parseLocalMdx } from './localMdx'

export async function importLocalMdxScope(
  absoluteFilePath: string,
  parsed: ReturnType<typeof parseLocalMdx>,
) {
  const require = createRequire(import.meta.url)
  const consumerRequire = createRequire(absoluteFilePath)
  const result = await build({
    stdin: {
      contents: `${parsed.statements}\nexport { ${parsed.names.join(', ')} }`,
      resolveDir: dirname(absoluteFilePath),
      sourcefile: absoluteFilePath,
      loader: 'tsx',
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    packages: 'external',
    plugins: [
      {
        name: 'runtime-packages',
        setup(builder) {
          builder.onResolve({ filter: /^[^./]|^@/ }, (args) => {
            if (args.path.startsWith('@pmndrs/docs/')) return { path: require.resolve(args.path) }
            if (args.path.startsWith('@/'))
              return builder.resolve(
                join(
                  dirname(require.resolve('@pmndrs/docs/package.json')),
                  args.path.startsWith('@/registry/')
                    ? args.path.slice(2)
                    : `src/${args.path.slice(2)}`,
                ),
                { kind: args.kind, resolveDir: args.resolveDir },
              )
            let resolved: string
            try {
              resolved = consumerRequire.resolve(args.path)
            } catch {
              resolved = require.resolve(args.path)
            }
            // React must remain the renderer's copy to keep hooks on the same dispatcher.
            if (args.path === 'react' || args.path.startsWith('react/'))
              resolved = require.resolve(args.path)
            return { path: pathToFileURL(resolved).href, external: true }
          })
        },
      },
    ],
  })
  return (await import(
    /* webpackIgnore: true */ `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`
  )) as Record<string, unknown>
}
