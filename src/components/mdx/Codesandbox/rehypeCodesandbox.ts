import resolveMdxUrl from '@/utils/resolveMdxUrl'
import type { Root } from 'hast'
import { visit } from 'unist-util-visit'

/**
 * A `<Codesandbox>` found in a page: its sandbox id, and its preview image if it has one.
 */
export type Box = {
  id: string
  /** Preview image, already resolved to a full URL when it was relative to the page */
  img?: string
}

/**
 * Finds every `<Codesandbox>` of a page and resolves its `img`, the same way `rehypeImg`
 * resolves an `<img src>`: a path relative to the page becomes a `MDX_BASEURL` URL, so
 * `Img` can read its dimensions; a full URL is left as is.
 *
 * `screenshot_url`, the deprecated name of `img`, is resolved too.
 *
 * @param relFilePath - Path of the page, relative to the MDX folder, e.g. "/authoring/codesandbox.mdx"
 * @param MDX_BASEURL - Base URL of the MDX folder
 * @param boxes - Filled with the sandboxes found, in page order
 */
export function rehypeCodesandbox(
  relFilePath: Parameters<typeof resolveMdxUrl>[1],
  MDX_BASEURL: Parameters<typeof resolveMdxUrl>[2],
  boxes: Box[] = [],
) {
  return () => (tree: Root) => {
    visit(tree, null, function (node) {
      const isCodesandbox = 'name' in node && node.name === 'Codesandbox'
      if (!isCodesandbox) return

      const attributes = node.attributes.filter((attribute) => 'name' in attribute)

      let img: string | undefined
      for (const attribute of attributes) {
        if (attribute.name !== 'img' && attribute.name !== 'screenshot_url') continue
        if (typeof attribute.value !== 'string') continue

        attribute.value = resolveMdxUrl(attribute.value, relFilePath, MDX_BASEURL)
        // `img` wins over its deprecated alias, whatever their order
        if (attribute.name === 'img' || img === undefined) img = attribute.value
      }

      const id = attributes.find((attribute) => attribute.name === 'id')?.value
      if (typeof id !== 'string') return

      boxes.push(img ? { id, img } : { id })
    })
  }
}
