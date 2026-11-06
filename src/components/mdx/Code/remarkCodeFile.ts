import { isInside } from '@/config.resolve'
import type { Root } from 'mdast'
import { repositoryRoot } from '@/utils/repositoryRoot'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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
