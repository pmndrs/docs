import { isInside } from '@/config.resolve'
import { join, relative, resolve } from 'node:path'

/**
 * Where a file of the MDX folder was written. The CLI compiles a copy of the MDX folder (`MDX`)
 * and says where the original is (`PMNDRS_MDX_SOURCE`), so that a path relative to a page, out of
 * the folder, still resolves. A path out of the copy, or without a copy, is the original already.
 * @param path - Absolute path of a file being compiled
 */
export function originalPath(path: string) {
  const { MDX, PMNDRS_MDX_SOURCE } = process.env
  if (!MDX || !PMNDRS_MDX_SOURCE) return path
  const copy = resolve(MDX)
  if (!isInside(copy, path)) return path
  return join(PMNDRS_MDX_SOURCE, relative(copy, path))
}
