import type { Root } from 'hast'
import { visit } from 'unist-util-visit'

// https://unifiedjs.com/learn/guide/create-a-rehype-plugin/
export function rehypeImg() {
  return (tree: Root) => {
    visit(tree, null, function (node) {
      // console.log(node)
      if (node.type === 'mdxJsxFlowElement' && node.name === 'img') node.name = 'Img' // map HTML <img> to <Img> React component
    })
  }
}
