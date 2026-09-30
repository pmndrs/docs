import type { Element, ElementContent, Parent, Root, RootContent } from 'hast'
import { visit } from 'unist-util-visit'

//
// Inline components written as JSX on lines of their own, e.g. `Badge`
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
// Each one then stands as a block of its own: the page lays out every top-level node as a
// block of the text column (`.post-container > *` in globals.css, unlayered, so its `display:
// block` beats a badge's `inline-flex` utility), and they stack. Inside another component,
// MDX drops the newline between them, and they touch. Any component listed in `names` is
// inline content, though, like a link: a run of them becomes the paragraph markdown would
// have made of it, with them as text elements and a space between them.
//

function isInlineFlow(
  node: RootContent,
  names: string[],
): node is Extract<RootContent, { type: 'mdxJsxFlowElement' }> {
  return node.type === 'mdxJsxFlowElement' && !!node.name && names.includes(node.name)
}

function isBlank(node: RootContent) {
  return node.type === 'text' && node.value.trim() === ''
}

/**
 * A component written over several lines, `<Badge>\n  storybook\n</Badge>`, has its text
 * parsed as a paragraph: keep the text only, a paragraph being no inline content.
 */
function inlineChildren(children: RootContent[]) {
  const meaningful = children.filter((child) => !isBlank(child))
  const [child] = meaningful
  if (meaningful.length === 1 && child.type === 'element' && child.tagName === 'p') {
    return child.children
  }
  return children
}

function wrapInlineFlows(parent: Root | Parent, names: string[]) {
  const children: RootContent[] = []
  let paragraph: Element | undefined // the paragraph of the current run, if any
  let blanks: RootContent[] = [] // whitespace after the run, kept only if the run ends there

  for (const child of parent.children) {
    if (isInlineFlow(child, names)) {
      if (paragraph) {
        // One space between two of them, as between two words — MDX keeps no whitespace
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

// https://unifiedjs.com/learn/guide/create-a-rehype-plugin/
export function rehypeInlineFlow(names: string[]) {
  return () => (tree: Root) => {
    visit(tree, function (node) {
      if ('children' in node && node.children.some((child) => isInlineFlow(child, names)))
        wrapInlineFlows(node, names)
    })
  }
}
