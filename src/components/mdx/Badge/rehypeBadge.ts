import type { Element, Root } from 'hast'
import { visit } from 'unist-util-visit'

//
// shields.io "tag" pills
//
// [![](https://img.shields.io/badge/-storybook-%23ff69b4)](https://drei.pmnd.rs/?path=/story/...)
// ![](https://img.shields.io/badge/-Dom%20only-red)
//
// are rewritten to:
//
// <Badge href="https://drei.pmnd.rs/?path=/story/...">storybook</Badge>
// <Badge>Dom only</Badge>
//
// Only static badges with an empty label (`/badge/-<message>-<color>`) are concerned: they are
// the plain text tags of the docs. Every other shields.io image (npm version, downloads,
// discord, logos...) carries live data or a logo, and is left as an image.
//

const SHIELDS_TAG_PREFIX = 'https://img.shields.io/badge/-'

/**
 * Returns the text of a shields.io "tag" badge URL, or `undefined` if the URL is not one.
 *
 * @example tagText('https://img.shields.io/badge/-storybook-%23ff69b4') // 'storybook'
 */
export function tagText(src: unknown) {
  if (typeof src !== 'string' || !src.startsWith(SHIELDS_TAG_PREFIX)) return undefined

  // `-<message>-<color>`, without any `?query`
  const content = src.slice(SHIELDS_TAG_PREFIX.length).split('?')[0]

  // shields.io escaping: `--` is a literal dash, a single `-` separates message from color
  const DASH = '\u0000'
  const [message, color] = content.replaceAll('--', DASH).split('-')
  if (!message || !color) return undefined

  // shields.io escaping: `__` is a literal underscore, a single `_` is a space
  const UNDERSCORE = '\u0001'
  const text = message
    .replaceAll(DASH, '-')
    .replaceAll('__', UNDERSCORE)
    .replaceAll('_', ' ')
    .replaceAll(UNDERSCORE, '_')

  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}

/**
 * The only meaningful child of a link: `[![](img)](href)` has no other.
 */
function onlyImage(link: Element) {
  const children = link.children.filter(
    (child) => !(child.type === 'text' && child.value.trim() === ''),
  )
  const [child] = children
  if (children.length !== 1 || child.type !== 'element' || child.tagName !== 'img') return undefined
  return child
}

function toBadge(node: Element, text: string, href?: unknown) {
  node.tagName = 'Badge' // map to <Badge> React component
  node.properties = typeof href === 'string' ? { href } : {}
  node.children = [{ type: 'text', value: text }]
}

// https://unifiedjs.com/learn/guide/create-a-rehype-plugin/
export function rehypeBadge() {
  return () => (tree: Root) => {
    visit(tree, 'element', function (node) {
      //
      // Linked badge: [![](https://img.shields.io/badge/-storybook-%23ff69b4)](href)
      //

      if (node.tagName === 'a') {
        const image = onlyImage(node)
        const text = tagText(image?.properties.src)
        if (text) toBadge(node, text, node.properties.href)
        return
      }

      //
      // Bare badge: ![](https://img.shields.io/badge/-Dom%20only-red)
      //

      if (node.tagName === 'img') {
        const text = tagText(node.properties.src)
        if (text) toBadge(node, text)
      }
    })
  }
}
