import type { Root } from 'hast'
import { visit } from 'unist-util-visit'

// https://unifiedjs.com/learn/guide/create-a-rehype-plugin/
export function rehypeSummary() {
  return (tree: Root) => {
    visit(tree, null, function (node) {
      // console.log(node)
      if (node.type === 'mdxJsxFlowElement' && node.name === 'summary') node.name = 'Summary' // map HTML <summary> to <Summary> React component
    })
  }
}
