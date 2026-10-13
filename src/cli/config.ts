import { validateDocsConfig } from '../docs.config'
import { build } from 'esbuild'
import { mkdtemp, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * Loads a trusted consumer module for HTML fragments. Next loads the original module itself
 * for websites so its server/client boundaries remain intact.
 * @param path - Absolute config path, or undefined for the built-in renderer
 */
export async function loadDocsConfig(path?: string) {
  if (!path) return {}

  // Beside the config so runtime requires can resolve the consumer's own node_modules.
  const directory = await mkdtemp(join(dirname(path), '.pmndrs-docs-config-'))
  const outfile = join(directory, 'config.mjs')
  const require = createRequire(import.meta.url)
  try {
    await build({
      entryPoints: [path],
      outfile,
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'node22.12',
      jsx: 'automatic',
      banner: {
        js: "import { createRequire as createConfigRequire } from 'node:module'; const require = createConfigRequire(import.meta.url);",
      },
      logLevel: 'silent',
      plugins: [
        {
          name: 'fragment-runtime',
          setup(build) {
            // Hooks must share the renderer's React instance, even with a separate install.
            build.onResolve({ filter: /^(react|react-dom|next)(\/.*)?$/ }, (args) => ({
              path: require.resolve(args.path),
              external: true,
            }))
            // Fragments carry no stylesheets, just as for the built-in components.
            build.onLoad({ filter: /\.css$/ }, () => ({ contents: '', loader: 'js' }))
          },
        },
      ],
    })
    const configModule = await import(pathToFileURL(outfile).href)
    return validateDocsConfig(configModule.default)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`Cannot load docs config ${path}: ${reason}`, { cause: error })
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}
