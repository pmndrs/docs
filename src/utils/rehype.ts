import { slugify } from './text'

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
 * Makes page headings linkable.
 */
export function headings() {
  return (root: Node) => {
    for (const node of root.children) {
      if (node.type === 'element' && /^h[1-4]$/.test(node.tagName)) {
        const title = node.children.reduce((acc, { value }) => `${acc}${value}`, '')
        const id = slugify(title)
        node.properties.id = id
      }
    }
  }
}
