import type { DocToC } from '@/app/[...slug]/DocsContext'

//

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
export const rehypeToc = (target: DocToC[] = [], url: string, page: string) => {
  return () => (root: Node) => {
    const previous: Record<number, DocToC> = {}

    for (let i = 0; i < root.children.length; i++) {
      const node = root.children[i]

      if (node.type === 'element' && /^h[1-4]$/.test(node.tagName)) {
        const level = parseInt(node.tagName[1])

        const title = toString(node)
        const id = slugify(title)
        node.properties.id = id

        //
        // Extract content for each heading
        //

        let siblingIndex = i + 1
        const content: string[] = []
        let sibling: Node | undefined = root.children[siblingIndex]
        while (sibling) {
          if (RegExp(`^h${level}$`).test(sibling.tagName)) break // stop at the next (same-level) heading

          content.push(toString(sibling))
          sibling = root.children[siblingIndex++]
        }

        const item: DocToC = {
          id,
          level,
          label: page,
          url: `${url}#${id}`,
          title,
          content: content.join(''),
          parent: previous[level - 2] ?? null,
        }
        previous[level - 1] = item

        target.push(item)
      }
    }
  }
}
