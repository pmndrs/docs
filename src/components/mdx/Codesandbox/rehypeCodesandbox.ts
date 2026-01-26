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
 * Retrieves CSB ids from page.
 */
export function rehypeCodesandbox(ids: string[] = []) {
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
