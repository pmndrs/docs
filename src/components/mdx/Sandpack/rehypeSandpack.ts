import type { Root } from 'hast'
import { resolve } from 'path'
import { visit } from 'unist-util-visit'

//
// <Sandpack folder="authoring-sandpack-cloud" />
//
// {
//   type: 'mdxJsxFlowElement',
//   name: 'Sandpack',
//   attributes: [
//     {
//       type: 'mdxJsxAttribute',
//       name: 'folder',
//       value: 'authoring-sandpack-cloud',
//       position: [Object]
//     },
//     ...
//   ],
//   position: {
//     start: { line: 3, column: 1, offset: 2 },
//     end: { line: 3, column: 32, offset: 33 }
//   },
//   data: { _mdxExplicitJsx: true },
//   children: []
// }

// https://unifiedjs.com/learn/guide/create-a-rehype-plugin/
export function rehypeSandpack(dir: string) {
  return () => (tree: Root) => {
    visit(tree, null, function (node) {
      if ('name' in node && node.name === 'Sandpack') {
        //
        // Resolve folder path
        //

        const folderAttr = node.attributes
          .filter((node) => 'name' in node)
          .find((attr) => attr.name === 'folder')

        if (folderAttr) {
          const oldFolder = folderAttr?.value

          if (typeof oldFolder === 'string') folderAttr.value = `${resolve(dir, oldFolder)}`
        }
      }
    })
  }
}
