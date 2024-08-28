import resolveMdxUrl from '@/utils/resolveMdxUrl'
import type { Root } from 'hast'
import { visit } from 'unist-util-visit'

//
// MD image
//
// ![](basic-example.gif)
//
// {
//   type: 'element',
//   tagName: 'img',
//   properties: { src: 'basic-example.gif', alt: '' },
//   children: [],
//   position: {
//     start: { line: 1, column: 1, offset: 0 },
//     end: { line: 1, column: 23, offset: 22 }
//   }
// }

//
// HTML image
//
// <img src="basic-example.gif" />
//
// {
//   type: 'mdxJsxFlowElement',
//   name: 'img',
//   attributes: [
//     {
//       type: 'mdxJsxAttribute',
//       name: 'src',
//       value: 'basic-example.gif',
//       position: [Object]
//     }
//   ],
//   position: {
//     start: { line: 3, column: 1, offset: 2 },
//     end: { line: 3, column: 32, offset: 33 }
//   },
//   data: { _mdxExplicitJsx: true },
//   children: []
// }

// https://unifiedjs.com/learn/guide/create-a-rehype-plugin/
export function rehypeImg(
  relFilePath: Parameters<typeof resolveMdxUrl>[1],
  MDX_BASEURL: Parameters<typeof resolveMdxUrl>[2],
) {
  return () => (tree: Root) => {
    visit(tree, null, function (node) {
      // console.log('node', node)

      const isMDImage = 'tagName' in node && node.tagName === 'img'
      const isHTMLImage = 'name' in node && node.name === 'img'

      if (isMDImage) {
        node.tagName = 'Img' // map to <Img> React component

        //
        // Resolve relative URLs
        //

        const oldSrc = node.properties.src
        if (typeof oldSrc === 'string') {
          node.properties.src = resolveMdxUrl(oldSrc, relFilePath, MDX_BASEURL)
        }
      }

      if (isHTMLImage) {
        node.name = 'Img' // map to <Img> React component

        //
        // Resolve relative URLs
        //

        const srcAttr = node.attributes
          .filter((node) => 'name' in node)
          .find((attr) => attr.name === 'src')

        if (srcAttr) {
          const oldSrc = srcAttr?.value

          if (typeof oldSrc === 'string')
            srcAttr.value = resolveMdxUrl(oldSrc, relFilePath, MDX_BASEURL)
        }
      }
    })
  }
}
