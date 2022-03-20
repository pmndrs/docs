export interface ASTNode {
  type: string
  value: string
  tagName: string
  properties: any
  children: ASTNode[]
}

export interface TocItem {
  id: string
  level: number
  title: string
  parent?: TocItem
}

/**
 * Generates a table of contents from page headings.
 */
export const tableOfContents = (target = []) => {
  return () => (root: ASTNode) => {
    const previous = {}

    for (const node of root.children) {
      if (node.type === 'element' && /^h[1-4]$/.test(node.tagName)) {
        const level = parseInt(node.tagName[1])

        const title = node.children.reduce((acc, { value }) => `${acc}${value}`, '')
        const id = title.toLowerCase().replace(/\s+|-+/g, '-')
        node.properties.id = id

        const item: TocItem = {
          id,
          level,
          title,
          parent: previous[level - 2] ?? null,
        }
        previous[level - 1] = item

        target.push(item)
      }
    }
  }
}
