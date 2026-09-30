import type { Element, ElementContent, Parent, Root, RootContent } from 'hast'
import { SKIP, visit } from 'unist-util-visit'
import { isShield, parseShield, type ShieldBadge } from './shields'

//
// shields.io badges
//
// [![](https://img.shields.io/badge/-storybook-%23ff69b4)](https://drei.pmnd.rs/?path=/story/...)
// ![](https://img.shields.io/badge/-Dom%20only-red)
// [![Storybook](https://img.shields.io/static/v1?message=Storybook&label=&logo=storybook)](https://drei.pmnd.rs/)
// [![Version](https://img.shields.io/npm/v/@react-three/drei)](https://www.npmjs.com/package/@react-three/drei)
//
// are rewritten to:
//
// <Badge href="https://drei.pmnd.rs/?path=/story/...">storybook</Badge>
// <Badge>Dom only</Badge>
// <Badge href="https://drei.pmnd.rs/" logo="storybook">Storybook</Badge>
// <Badge href="https://www.npmjs.com/package/@react-three/drei">npm</Badge>
//
// Only what the URL declares: label, message, the link and `logo=`. The badge is neutral, its
// shields.io color dropped: a color is for the author to declare, `<Badge color>`. Live badges
// keep their name only, never their value: nothing is fetched. See `./shields.ts`.
//
// All or nothing, per container: a Badge never sits next to a shields.io image. When one
// shields.io image of a paragraph (or of any other parent) is not a badge `parseShield` reads,
// every shields.io image of it stays an image.
//

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

function toBadge(node: Element, { label, message, logo }: ShieldBadge, href?: unknown) {
  node.tagName = 'Badge' // map to <Badge> React component
  node.properties = {}
  if (typeof href === 'string') node.properties.href = href
  if (label) node.properties.label = label
  if (logo) node.properties.logo = logo
  node.children = [{ type: 'text', value: message }]
}

//
// Badges written as JSX on lines of their own
//
// <Badge>a</Badge> <Badge>b</Badge>
//
// or
//
// <Badge>a</Badge>
// <Badge>b</Badge>
//
// MDX parses JSX alone on its line(s) as flow content, which it does not wrap in a paragraph:
//
// [
//   { type: 'mdxJsxFlowElement', name: 'Badge', children: [...] },
//   { type: 'text', value: '\n' },
//   { type: 'mdxJsxFlowElement', name: 'Badge', children: [...] },
// ]
//
// Each badge then stands as a block of its own: the page lays out every top-level node as a
// block of the text column (`.post-container > *` in globals.css, unlayered, so its `display:
// block` beats the badge's `inline-flex` utility), and the badges stack. Inside another
// component, MDX drops the newline between them, and they touch. A badge is inline content,
// though, like a link: a run of them becomes the paragraph markdown would have made of it,
// with badges as text elements and a space between them — which is how the shields.io badges
// already come.
//

function isFlowBadge(node: RootContent) {
  return node.type === 'mdxJsxFlowElement' && node.name === 'Badge'
}

function isBlank(node: RootContent) {
  return node.type === 'text' && node.value.trim() === ''
}

/**
 * A badge written over several lines, `<Badge>\n  storybook\n</Badge>`, has its text parsed
 * as a paragraph: keep the text only, a paragraph being no content of a badge.
 */
function inlineChildren(children: RootContent[]) {
  const meaningful = children.filter((child) => !isBlank(child))
  const [child] = meaningful
  if (meaningful.length === 1 && child.type === 'element' && child.tagName === 'p') {
    return child.children
  }
  return children
}

function wrapFlowBadges(parent: Root | Parent) {
  const children: RootContent[] = []
  let paragraph: Element | undefined // the paragraph of the current run of badges, if any
  let blanks: RootContent[] = [] // whitespace after the run, kept only if the run ends there

  for (const child of parent.children) {
    if (child.type === 'mdxJsxFlowElement' && child.name === 'Badge') {
      if (paragraph) {
        // One space between two badges, as between two words — MDX keeps no whitespace
        // between flow elements inside JSX
        paragraph.children.push({ type: 'text', value: ' ' })
      } else {
        paragraph = { type: 'element', tagName: 'p', properties: {}, children: [] }
        children.push(paragraph)
      }
      paragraph.children.push({
        ...child,
        type: 'mdxJsxTextElement',
        children: inlineChildren(child.children),
      } as ElementContent)
      blanks = []
      continue
    }

    if (paragraph && isBlank(child)) {
      blanks.push(child)
      continue
    }

    children.push(...blanks, child)
    paragraph = undefined
    blanks = []
  }
  children.push(...blanks)

  parent.children = children as typeof parent.children
}

/**
 * A shields.io image among the children of a node, alone in its link or bare.
 */
type Candidate = { node: Element; src: string; href?: unknown }

function candidate(child: ElementContent): Candidate | undefined {
  if (child.type !== 'element') return undefined

  // Linked badge: [![](https://img.shields.io/badge/-storybook-%23ff69b4)](href)
  if (child.tagName === 'a') {
    const src = onlyImage(child)?.properties.src
    return isShield(src) ? { node: child, src, href: child.properties.href } : undefined
  }

  // Bare badge: ![](https://img.shields.io/badge/-Dom%20only-red)
  if (child.tagName === 'img' && isShield(child.properties.src)) {
    return { node: child, src: child.properties.src }
  }

  return undefined
}

function isShieldLink(node: Root | RootContent) {
  return (
    node.type === 'element' && node.tagName === 'a' && isShield(onlyImage(node)?.properties.src)
  )
}

// https://unifiedjs.com/learn/guide/create-a-rehype-plugin/
export function rehypeBadge() {
  return () => (tree: Root) => {
    visit(tree, function (node) {
      // A shields.io link left as is: its image is not a badge of its own
      if (isShieldLink(node)) return SKIP
      if (!('children' in node)) return

      const candidates = (node.children as ElementContent[]).flatMap(
        (child) => candidate(child) ?? [],
      )
      const badges = candidates.map(({ src }) => parseShield(src))
      if (!badges.every((badge) => badge !== undefined)) return // all or nothing

      candidates.forEach(({ node: image, href }, i) => toBadge(image, badges[i], href))
    })

    //
    // Flow badges: <Badge>a</Badge>\n<Badge>b</Badge>
    //

    visit(tree, function (node) {
      if ('children' in node && node.children.some(isFlowBadge)) wrapFlowBadges(node)
    })
  }
}
