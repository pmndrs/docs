/// <reference types="mdast-util-mdx-jsx" />
import type { Root, Content } from 'mdast'
import type { DocToC } from 'hooks/useDocs'

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

    const traverse = (node: Root | Content) => {
      switch (node.type) {
        case 'heading': {
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

          break
        }
        case 'paragraph': {
          if (needsDescription) {
            needsDescription.description = toString(node)
            needsDescription = null
          }
          break
        }
        case 'root':
          for (const child of root.children) traverse(child)
      }
    }

    traverse(root)
  }
}

/**
 * Fetches a list of generated codesandbox components.
 */
export function codesandbox(ids: string[] = []) {
  return () => (root: Root) => {
    const traverse = (node: Root | Content) => {
      if (node.type === 'mdxJsxFlowElement' && node.name === 'codesandbox') {
        // @ts-ignore
        ids.push(node.attributes.find(({ name }) => name === 'id').value)
      } else if ('children' in node) {
        for (const child of node.children) traverse(child)
      }
    }

    traverse(root)
  }
}
