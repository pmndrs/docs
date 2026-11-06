import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

/**
 * The nearest ancestor of a folder, itself included, holding an entry of that name.
 * @param dir - Folder to start from
 * @param entry - File or folder name to look for
 */
function nearest(dir: string, entry: string) {
  for (let folder = resolve(dir); ; folder = dirname(folder)) {
    if (existsSync(join(folder, entry))) return folder
    if (dirname(folder) === folder) return undefined
  }
}

/**
 * The repository holding a folder: its nearest ancestor, itself included, with a `.git` entry (a
 * folder, or a file in a worktree). Without one, as on Vercel, which builds from the files alone:
 * the nearest with a `package.json`, the project. The folder itself, outside of both.
 * @param dir - Folder of the page being compiled
 */
export function repositoryRoot(dir: string) {
  return nearest(dir, '.git') ?? nearest(dir, 'package.json') ?? resolve(dir)
}
