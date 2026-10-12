import { build } from 'esbuild'
import { createRequire, isBuiltin } from 'node:module'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { parseLocalMdx } from './localMdx'

export async function importLocalMdxScope(
  absoluteFilePath: string,
  parsed: ReturnType<typeof parseLocalMdx>,
) {
  const require = createRequire(import.meta.url)
  const engineRoot = dirname(require.resolve('@pmndrs/docs/package.json'))
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
    plugins: [
      {
        name: 'runtime-packages',
        setup(builder) {
          builder.onResolve({ filter: /^[^./]|^@/ }, async (args) => {
            if (args.pluginData?.resolvingExternal) return undefined
            if (isBuiltin(args.path)) return { path: args.path, external: true }
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
            const engineReact = args.path === 'react' || args.path.startsWith('react/')
            const resolvePackage = (resolveDir: string) =>
              builder.resolve(args.path, {
                kind: args.kind,
                resolveDir,
                pluginData: { resolvingExternal: true },
              })
            let resolved = await resolvePackage(engineReact ? engineRoot : args.resolveDir)
            if (resolved.errors.length && !engineReact) resolved = await resolvePackage(engineRoot)
            if (resolved.errors.length) return { errors: resolved.errors }
            // Resolve with import conditions, including ESM-only package subpaths. React
            // remains the renderer's copy to keep hooks on the same dispatcher.
            return { path: pathToFileURL(resolved.path).href, external: true }
          })
        },
      },
    ],
  })
  return (await import(
    /* webpackIgnore: true */ `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`
  )) as Record<string, unknown>
}
