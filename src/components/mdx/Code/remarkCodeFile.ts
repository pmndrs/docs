import { isInside } from '@/config.resolve'
import type { Root } from 'mdast'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { visit } from 'unist-util-visit'
import { parseMetaAttribute } from './rehypeCode'

/**
 * The `file="..."` of a fence's meta, e.g. `../../dev.sh` for ```` ```sh file="../../dev.sh" ````.
 * @param meta - Meta of the fence, after its language
 */
export function parseFile(meta: string | null | undefined) {
  return parseMetaAttribute(meta, 'file')
}

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
function repositoryRoot(dir: string) {
  return nearest(dir, '.git') ?? nearest(dir, 'package.json') ?? resolve(dir)
}

/**
 * Fills a fenced code block with a file, e.g. ```` ```sh file="../../dev.sh" ````: the block shows
 * the file as it is, rather than a copy of it that drifts. Whatever the fence holds is replaced,
 * and `file=` leaves the meta: the path means nothing to the reader of the exported Markdown.
 *
 * The path is relative to the page's folder. It must stay in the repository holding the page
 * (see `repositoryRoot`): a page cannot show a file of the machine that builds it. A file out of it, or that cannot be read, fails the page,
 * as a broken include should.
 *
 * @param dir - Folder of the page being compiled
 */
export function remarkCodeFile(dir: string) {
  return () => (tree: Root) => {
    const root = repositoryRoot(dir)
    visit(tree, 'code', (node) => {
      const file = parseFile(node.meta)
      if (!file) return

      const path = resolve(dir, file)
      if (!isInside(root, path)) {
        throw new Error(`file="${file}" is outside the repository holding the page: ${root}`)
      }
      node.value = readFileSync(path, 'utf8').replace(/\r?\n$/, '')

      const meta = node.meta?.replace(/(^|[\s}])file=(?:"[^"]*"|'[^']*')\s*/, '$1').trim()
      node.meta = meta || null
    })
  }
}
