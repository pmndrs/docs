import type { Root } from 'hast'
import { visit } from 'unist-util-visit'

//
// MD link
//
// [text](/path)
//
// {
//   type: 'element',
//   tagName: 'a',
//   properties: { href: '/path' },
//   children: [...],
//   position: {...}
// }

//
// HTML link
//
// <a href="/path">text</a>
//
// {
//   type: 'mdxJsxFlowElement',
//   name: 'a',
//   attributes: [
//     {
//       type: 'mdxJsxAttribute',
//       name: 'href',
//       value: '/path',
//       position: [Object]
//     }
//   ],
//   position: {...},
//   data: { _mdxExplicitJsx: true },
//   children: [...]
// }

// https://unifiedjs.com/learn/guide/create-a-rehype-plugin/
export function rehypeLink(BASE_PATH: string | undefined) {
  return () => (tree: Root) => {
    // Only process if BASE_PATH is defined and not empty
    if (!BASE_PATH) return

    visit(tree, null, function (node) {
      const isMDLink = 'tagName' in node && node.tagName === 'a'
      const isHTMLLink = 'name' in node && node.name === 'a'

      if (isMDLink) {
        //
        // Resolve links starting with /
        //

        const oldHref = node.properties.href
        if (typeof oldHref === 'string' && oldHref.startsWith('/')) {
          node.properties.href = BASE_PATH + oldHref
        }
      }

      if (isHTMLLink) {
        //
        // Resolve links starting with /
        //

        const hrefAttr = node.attributes
          .filter((node) => 'name' in node)
          .find((attr) => attr.name === 'href')

        if (hrefAttr) {
          const oldHref = hrefAttr?.value

          if (typeof oldHref === 'string' && oldHref.startsWith('/'))
            hrefAttr.value = BASE_PATH + oldHref
        }
      }
    })
  }
}
