import { slugify } from './text'

export interface Node {
  type: string
  name?: string
  value: string
  tagName?: string
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

/**
 * Fetches a list of generated codesandbox components.
 */
export function codesandbox(ids = []) {
  return () => (root: Node) => {
    const traverse = (node: Node) => {
      if (node.name === 'Codesandbox') {
        const id = node.attributes.find(({ name }) => name === 'id')
        return ids.push(id.value)
      }

      if (node.children) for (const child of node.children) traverse(child)
    }
    traverse(root)
  }
}
