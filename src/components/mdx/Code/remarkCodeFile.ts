import type { Root } from 'mdast'
import { readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { visit } from 'unist-util-visit'

/**
 * The `file="..."` of a fence's meta, e.g. `../../dev.sh` for ```` ```sh file="../../dev.sh" ````.
 * Double or single quotes. After a space, or the `}` of line highlights: `{2}file="dev.sh"`.
 */
export function parseFile(meta: string | null | undefined) {
  const match = meta?.match(/(?:^|[\s}])file=(?:"([^"]*)"|'([^']*)')/)
  const file = match?.[1] ?? match?.[2]
  return file || undefined
}

/**
 * Where a page's folder was written. The CLI compiles a copy of the MDX folder (`MDX`) and says
 * where the original is (`PMNDRS_MDX_SOURCE`), so that a path out of the folder still resolves.
 * @param dir - Folder of the page being compiled
 */
function sourceDir(dir: string) {
  const { MDX, PMNDRS_MDX_SOURCE } = process.env
  if (!MDX || !PMNDRS_MDX_SOURCE) return dir
  const path = relative(resolve(MDX), dir)
  return path.startsWith('..') ? dir : join(PMNDRS_MDX_SOURCE, path)
}

/**
 * Fills a fenced code block with a file, e.g. ```` ```sh file="../../dev.sh" ````: the block shows
 * the file as it is, rather than a copy of it that drifts. Whatever the fence holds is replaced.
 *
 * The path is relative to the page's folder. A file that cannot be read fails the page, as a
 * broken include should.
 *
 * @param dir - Folder of the page being compiled
 */
export function remarkCodeFile(dir: string) {
  return () => (tree: Root) => {
    visit(tree, 'code', (node) => {
      const file = parseFile(node.meta)
      if (!file) return

      node.value = readFileSync(resolve(sourceDir(dir), file), 'utf8').replace(/\n$/, '')
    })
  }
}
