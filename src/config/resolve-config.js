import { existsSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'

/**
 * Finds the consumer module without evaluating it. Explicit paths must exist; an absent
 * conventional config keeps the built-in renderer. Paths are relative to the caller's cwd.
 * @param {string} cwd - Consumer working directory
 * @param {string | undefined} explicit - Path supplied with --config or DOCS_CONFIG
 */
export function resolveDocsConfig(cwd, explicit) {
  if (explicit) {
    const path = resolve(cwd, explicit)
    if (!existsSync(path)) throw new Error(`Docs config not found: ${path}`)
    return path
  }
  const path = resolve(cwd, 'docs.config.ts')
  return existsSync(path) ? path : undefined
}

/**
 * Keeps the app and consumer modules inside Turbopack's filesystem root.
 * @param {string} appDir - Directory containing the Next application
 * @param {string} configDir - Directory containing the consumer module
 */
export function commonRoot(appDir, configDir) {
  let root = resolve(appDir)
  const target = resolve(configDir)
  while (true) {
    const path = relative(root, target)
    if (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path)) return root
    const parent = dirname(root)
    if (parent === root) throw new Error('The docs app and config must be on the same filesystem')
    root = parent
  }
}
