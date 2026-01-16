import type { Root } from 'hast'
import { visit } from 'unist-util-visit'

export function rehypeMermaid() {
  return () => (tree: Root) => {
    visit(tree, 'element', (node: any) => {
      // Look for <pre><code class="language-mermaid">...</code></pre>
      if (
        node.tagName === 'pre' &&
        node.children?.length === 1 &&
        node.children[0].tagName === 'code' &&
        node.children[0].properties?.className?.includes('language-mermaid')
      ) {
        const codeNode = node.children[0]
        const textNode = codeNode.children?.[0]

        if (textNode?.type === 'text' && textNode.value) {
          // Transform to <Mermaid chart="...diagram code..." />
          node.tagName = 'Mermaid'
          node.properties = {
            chart: textNode.value.trim(),
          }
          node.children = []
        }
      }
    })
  }
}
