/// <reference types="mdast-util-mdx-jsx" />
import type { Root, Content } from 'mdast'
import type { DocToC } from 'hooks/useDocs'
import { visit } from 'unist-util-visit'

/**
 * Extracts the text content of a Node and its descendants.
 */
const toString = (node: Content): string =>
  ('value' in node && node.value) ||
  ('children' in node && node.children.map(toString).join('')) ||
  ''

/**
 * Converts a TitleCase string into a url-safe slug.
 */
const slugify = (title: string) => title.toLowerCase().replace(/\s+|-+/g, '-')

/**
 * Generates a table of contents from page headings.
 */
export const toc = (target: DocToC[] = [], url: string, page: string) => {
  return () => (root: Root) => {
    const parents: Record<number, DocToC> = {}
    let needsDescription: DocToC | null = null

    visit(root, (node) => {
      if (node.type === 'heading') {
        const title = toString(node)
        const id = slugify(title)

        const item: DocToC = {
          title,
          id,
          label: page,
          url: `${url}#${id}`,
          description: '',
          parent: parents[node.depth - 2] ?? null,
        }
        needsDescription = parents[node.depth - 1] = item

        target.push(item)
      } else if (node.type === 'paragraph' && needsDescription) {
        needsDescription.description = toString(node)
        needsDescription = null
      }
    })
  }
}

/**
 * Fetches a list of generated codesandbox components.
 */
export function codesandbox(ids: string[] = []) {
  return () => (root: Root) => {
    visit(root, (node) => {
      if (node.type === 'mdxJsxFlowElement' && node.name === 'codesandbox') {
        // @ts-ignore
        ids.push(node.attributes.find(({ name }) => name === 'id').value)
      }
    })
  }
}
