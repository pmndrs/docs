import type { Root } from 'hast'
import { visit } from 'unist-util-visit'

export function rehypeCode() {
  return () => (tree: Root) => {
    visit(tree, null, function (node) {
      // console.log('node', node)

      const isMDPre =
        'tagName' in node &&
        node.tagName === 'pre' &&
        node.properties?.className?.toString()?.includes('language-')

      if (isMDPre) {
        node.tagName = 'Code' // map to <Code> React component
      }
    })
  }
}
