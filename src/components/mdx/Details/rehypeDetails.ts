import type { Root } from 'hast'
import { visit } from 'unist-util-visit'

// https://unifiedjs.com/learn/guide/create-a-rehype-plugin/
export function rehypeDetails() {
  return (tree: Root) => {
    visit(tree, null, function (node) {
      // console.log(node)
      if (node.type === 'mdxJsxFlowElement' && node.name === 'details') node.name = 'Details' // map HTML <details> to <Details> React component
    })
  }
}
