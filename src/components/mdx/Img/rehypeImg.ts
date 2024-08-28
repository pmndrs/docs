import resolveMdxUrl from '@/utils/resolveMdxUrl'
import type { Root } from 'hast'
import { visit } from 'unist-util-visit'

import type { MdxJsxAttribute } from 'mdast-util-mdx-jsx'

// https://unifiedjs.com/learn/guide/create-a-rehype-plugin/
export function rehypeImg(
  relFilePath: Parameters<typeof resolveMdxUrl>[1],
  MDX_BASEURL: Parameters<typeof resolveMdxUrl>[2],
) {
  return () => (tree: Root) => {
    visit(tree, null, function (node) {
      // console.log(node)
      if (node.type === 'mdxJsxFlowElement' && node.name === 'img') {
        node.name = 'Img' // map HTML <img> to <Img> React component

        //
        // Resolve relative URLs
        //

        const srcAttr = (
          node.attributes.filter(({ type }) => type === 'mdxJsxAttribute') as MdxJsxAttribute[]
        ).find((attr) => attr.name === 'src')

        if (srcAttr) {
          const src = srcAttr.value
          if (typeof src === 'string') srcAttr.value = resolveMdxUrl(src, relFilePath, MDX_BASEURL)
        }
      }
    })
  }
}
