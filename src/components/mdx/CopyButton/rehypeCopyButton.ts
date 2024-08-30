export interface Node {
  type: string
  name?: string
  value?: string
  tagName: string
  attributes: Node[]
  properties: any
  children: Node[]
}

export const rehypeCopyButton = ({
  copyIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='rgba(128,128,128,1)' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24'%3E%3Crect width='8' height='4' x='8' y='2' rx='1' ry='1'/%3E%3Cpath d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/%3E%3C/svg%3E",
  copiedIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='rgba(128,128,128,1)' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24'%3E%3Crect width='8' height='4' x='8' y='2' rx='1' ry='1'/%3E%3Cpath d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/%3E%3Cpath d='m9 14 2 2 4-4'/%3E%3C/svg%3E",
  feedbackDuration = 3000,
} = {}) => {
  return () => (root: Node) => {
    let i = 0
    let s = root.children.length

    for (; i < s; i++) {
      if (
        root.children[i].tagName === 'pre' &&
        root.children[i].properties?.className?.toString()?.includes('language-')
      ) {
        root.children[i] = {
          type: 'element',
          tagName: 'ContainerCopyButton',
          children: [
            {
              type: 'element',
              tagName: 'CopyButton',
              properties: { copyIcon, copiedIcon, feedbackDuration },
              children: [],
            } as never,
            root.children[i],
          ],
        } as never
      }
    }
  }
}
