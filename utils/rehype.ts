const providers = ['codesandbox.io']

export interface ASTNode {
  type: string
  value: string
  tagName: string
  properties: any
  children: ASTNode[]
}

/**
 * Replaces links from whitelisted providers with preview iframes.
 */
export const embeds = () => {
  return (root: ASTNode) => {
    for (const node of root.children) {
      if (node.type === 'element' && node.tagName === 'p') {
        const textContent = node.children[0]?.value

        if (new RegExp(`^https:\\/{2}(${providers.join('|')})[^\\s]*?$`).test(textContent)) {
          node.tagName = 'iframe'
          node.properties.src = textContent
          node.children = []
        }
      }
    }
  }
}

/**
 * Generates a table of contents from page headings.
 */
export const tableOfContents = (target = []) => {
  return () => (root: ASTNode) => {
    const previous = {}

    for (const node of root.children) {
      if (node.type === 'element' && /^h[1-3]$/.test(node.tagName)) {
        const level = parseInt(node.tagName[1])

        const title = node.children.reduce((acc, { value }) => `${acc}${value}`, '')
        const id = title.toLowerCase().replace(/\s+|-+/g, '-')
        node.properties.id = id

        const item = {
          id,
          level,
          title,
          children: [],
        }
        previous[level - 1] = item

        const parent = previous[level - 2]
        if (parent) {
          parent.children.push(item)
        } else {
          target.push(item)
        }
      }
    }
  }
}
