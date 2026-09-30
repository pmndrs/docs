import resolveMdxUrl from '@/utils/resolveMdxUrl'
import type { Root } from 'hast'
import fs from 'node:fs'
import { resolve } from 'node:path'
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
 * Value of a JSX attribute: a string for `id="abc"`, an expression for `id={...}`.
 */
type AttributeValue =
  | string
  | {
      data?: {
        // The `estree` program of the expression; typed by hand, `estree` types aren't a dependency
        estree?: {
          body: { type: string; expression?: { type: string; value?: unknown } }[]
        } | null
      }
    }
  | null
  | undefined

/**
 * Reads the string of an attribute written `id="abc"`, or as a string literal `id={"abc"}`.
 * Any other expression gives `undefined`.
 */
function stringValue(value: AttributeValue) {
  if (typeof value === 'string') return value

  const body = value?.data?.estree?.body
  if (body?.length !== 1) return undefined

  const [statement] = body
  if (statement.type !== 'ExpressionStatement') return undefined

  const { expression } = statement
  if (expression?.type !== 'Literal' || typeof expression.value !== 'string') return undefined

  return expression.value
}

/**
 * Local path of an image of the MDX folder, the same way `Img` maps it to read its dimensions.
 * `undefined` for an image outside the MDX folder, which cannot be checked.
 */
function mdxFolderPath(src: string, MDX_BASEURL?: string) {
  const { MDX } = process.env
  if (!MDX_BASEURL || !MDX || !src.startsWith(MDX_BASEURL)) return undefined

  return resolve(src.replace(MDX_BASEURL, MDX))
}

function isFile(path: string) {
  return fs.existsSync(path) && fs.statSync(path).isFile()
}

/**
 * Finds every `<Codesandbox>` of a page and resolves its `img`, the same way `rehypeImg`
 * resolves an `<img src>`: a path relative to the page becomes a `MDX_BASEURL` URL, so
 * `Img` can read its dimensions; a full URL is left as is.
 *
 * `screenshot_url`, the deprecated name of `img`, is resolved too.
 *
 * An empty `img`, or one pointing to a missing file of the MDX folder (warned), is removed:
 * the placeholder stands in.
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

      const id = stringValue(attributes.find((attribute) => attribute.name === 'id')?.value)

      let img: string | undefined
      for (const attribute of attributes) {
        if (attribute.name !== 'img' && attribute.name !== 'screenshot_url') continue

        const value = stringValue(attribute.value)
        if (value === undefined) continue // any other expression is left as is

        // An empty `img` is no image
        if (value.trim() === '') {
          node.attributes.splice(node.attributes.indexOf(attribute), 1)
          continue
        }

        const src = resolveMdxUrl(value, relFilePath, MDX_BASEURL)

        // A missing file would crash `Img`, which reads its dimensions
        const path = mdxFolderPath(src, MDX_BASEURL)
        if (path && !isFile(path)) {
          console.warn(
            `${relFilePath}: <Codesandbox id="${id}"> ${attribute.name} not found: ${path} -- showing the placeholder instead`,
          )
          node.attributes.splice(node.attributes.indexOf(attribute), 1)
          continue
        }

        attribute.value = src
        // `img` wins over its deprecated alias, whatever their order
        if (attribute.name === 'img' || img === undefined) img = src
      }

      if (id === undefined) return

      boxes.push(img ? { id, img } : { id })
    })
  }
}
