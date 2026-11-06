import type { Element, Root } from 'hast'
import { visit } from 'unist-util-visit'

/**
 * The value of a `name="..."` attribute of a fence's meta, e.g. `x.ts` for `title="x.ts"`.
 * Double or single quotes. After a space, or the `}` of line highlights: `{2}title="x.ts"`. An
 * empty value is none.
 * @param meta - Meta of the fence, after its language
 * @param name - Name of the attribute
 */
export function parseMetaAttribute(meta: string | null | undefined, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = meta?.match(new RegExp(`(?:^|[\\s}])${escaped}=(?:"([^"]*)"|'([^']*)')`))
  const value = match?.[1] ?? match?.[2]
  return value || undefined
}

/**
 * The `title="..."` of a fence's meta, e.g. `lib/utils.ts` for ```` ```ts title="lib/utils.ts" ````.
 * @param meta - Meta of the fence, after its language
 */
export function parseTitle(meta: string | undefined) {
  return parseMetaAttribute(meta, 'title')
}

/**
 * Whether a fence's meta has the `collapsible` flag, e.g. ```` ```css title="globals.css" collapsible ````.
 * Not a word of a quoted value. After a space, or the `}` of line highlights: `{2}collapsible`.
 */
export function parseCollapsible(meta: string | undefined) {
  const unquoted = meta?.replace(/"[^"]*"|'[^']*'/g, '') ?? ''
  return /(?:^|[\s}])collapsible(?:\s|$)/.test(unquoted)
}

/**
 * Maps a fenced code block's `<pre>` to the `<Code>` component, with the `title` and the
 * `collapsible` flag of its fence's meta as props.
 *
 * Runs after `rehype-prism-plus`, which keeps the meta where `mdast-util-to-hast` puts it: on the
 * `<code>`'s `data.meta`.
 */
export function rehypeCode() {
  return () => (tree: Root) => {
    visit(tree, 'element', function (node) {
      const isMDPre =
        node.tagName === 'pre' && node.properties?.className?.toString()?.includes('language-')
      if (!isMDPre) return

      node.tagName = 'Code' // map to <Code> React component

      const codeNode = node.children.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'code',
      )
      const meta = typeof codeNode?.data?.meta === 'string' ? codeNode.data.meta : undefined
      const title = parseTitle(meta)
      if (title) node.properties = { ...node.properties, title }
      if (parseCollapsible(meta)) node.properties = { ...node.properties, collapsible: true }
    })
  }
}
