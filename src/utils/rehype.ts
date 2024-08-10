import type { DocToC } from '@/app/[...slug]/DocsContext'

export interface Node {
  type: string
  name?: string
  value: string
  tagName: string
  attributes: Node[]
  properties: any
  children: Node[]
}

/**
 * Extracts the text content of a Node and its descendants.
 */
const toString = (node: Node): string => node.children?.map(toString).join('') ?? node.value ?? ''

/**
 * Converts a TitleCase string into a url-safe slug.
 */
const slugify = (title: string) => title.toLowerCase().replace(/\s+|-+/g, '-')

/**
 * Generates a table of contents from page headings.
 */
export const toc = (target: DocToC[] = [], url: string, page: string, content: string) => {
  return () => (root: Node) => {
    const previous: Record<number, DocToC> = {}

    for (let i = 0; i < root.children.length; i++) {
      const node = root.children[i]

      if (node.type === 'element' && /^h[1-4]$/.test(node.tagName)) {
        const level = parseInt(node.tagName[1])

        const title = toString(node)
        const id = slugify(title)
        node.properties.id = id

        let siblingIndex = i + 1
        let sibling: Node | undefined = root.children[siblingIndex]
        while (sibling?.type === 'text') sibling = root.children[siblingIndex++]
        const description = sibling?.tagName === 'p' ? toString(sibling) : ''

        const item: DocToC = {
          id,
          level,
          label: page,
          url: `${url}#${id}`,
          title,
          description,
          content,
          parent: previous[level - 2] ?? null,
        }
        previous[level - 1] = item

        target.push(item)
      }
    }
  }
}

/**
 * Retrieves CSB ids from page.
 */
export function codesandbox(ids: string[] = []) {
  return () => (root: Node) => {
    const traverse = (node: Node) => {
      if (node.name === 'Codesandbox') {
        const id = node.attributes.find(({ name }) => name === 'id')!
        return ids.push(id.value)
      }

      if (node.children) for (const child of node.children) traverse(child)
    }
    traverse(root)
  }
}
