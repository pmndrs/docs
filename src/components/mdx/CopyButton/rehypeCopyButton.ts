export interface Node {
  type: string
  name?: string
  value?: string
  tagName: string
  attributes: Node[]
  properties: any
  children: Node[]
}

export const rehypeCopyButton = () => {
  return (root: Node) => {
    let i = 0
    let s = root.children.length

    for (; i < s; i++) {
      if (
        root.children[i].tagName === 'pre' &&
        root.children[i].properties?.className?.toString()?.includes('language-')
      ) {
        root.children[i] = {
          type: 'element',
          tagName: 'div',
          properties: {
            className: `container-${root.children[i].properties.className}`,
          },
          children: [
            {
              type: 'element',
              tagName: 'CopyButton',
              children: [],
            } as never,
            root.children[i],
          ],
        } as never
      }
    }
  }
}
