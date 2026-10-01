import type { DocToC } from '@/app/[...slug]/DocsContext'

//

export interface Node {
  type: string
  name?: string
  value: string
  tagName: string
  attributes: Node[]
  properties: any
  children: Node[]
}

/**
 * Extracts the text content of a Node and its descendants.
 */
const toString = (node: Node): string => node.children?.map(toString).join('') ?? node.value ?? ''

/**
 * Converts a TitleCase string into a url-safe slug.
 */
const slugify = (title: string) => title.toLowerCase().replace(/\s+|-+/g, '-')

/**
 * A markdown heading: an `<h2>` written in JSX (an `mdxJsxFlowElement`) is not one.
 */
const isHeading = (node: Node) => node.type === 'element' && /^h[1-6]$/.test(node.tagName)

/**
 * The row of tab triggers: their labels ("React", "Vue"...) are not content of their own.
 */
const isTabList = (node: Node) =>
  ((node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
    node.name === 'TabsList') ||
  (node.type === 'element' && node.properties?.role === 'tablist')

/**
 * Nodes whose value is code (imports, `{...}` expressions) or markup, not text of the page.
 */
const nonTextTypes = ['mdxjsEsm', 'mdxFlowExpression', 'mdxTextExpression', 'comment', 'raw']

/**
 * Generates a table of contents from page headings, nested ones included (e.g. a heading in a
 * `TabsContent` or a `Details`).
 *
 * Each heading gets a unique `id`: the same title twice in a page gets `-1`, `-2`... suffixes on
 * its 2nd, 3rd occurrence (as GitHub does).
 */
export const rehypeToc = (target: DocToC[] = [], url: string, page: string) => {
  return () => (root: Node) => {
    const previous: Record<number, DocToC> = {}
    const slugCounts = new Map<string, number>()
    const items = new Map<Node, DocToC>()

    const uniqueId = (slug: string) => {
      const count = slugCounts.get(slug) ?? 0
      slugCounts.set(slug, count + 1)
      return count === 0 ? slug : `${slug}-${count}`
    }

    //
    // Every heading of the page, in document order
    //

    const visitHeadings = (node: Node) => {
      if (isHeading(node)) {
        const level = parseInt(node.tagName[1]) - 1

        const title = toString(node)
        const id = uniqueId(slugify(title))
        node.properties.id = id

        const item: DocToC = {
          id,
          level,
          label: page,
          url: `${url}#${id}`,
          title,
          content: '',
          parent: previous[level - 2] ?? null,
        }
        previous[level - 1] = item

        target.push(item)
        items.set(node, item)
      }

      node.children?.forEach(visitHeadings)
    }
    visitHeadings(root)

    //
    // Extract content for each heading: the text after it, up to the next heading or the end of
    // the component it is in. Text after that component goes back to the heading before it.
    //

    // Keeps the last word before a component apart from the first one in it (or after it)
    const separate = (item: DocToC | null) => {
      if (item && item.content && !/\s$/.test(item.content)) item.content += '\n'
    }

    const walk = (parent: Node, active: DocToC | null) => {
      for (const node of parent.children) {
        if (nonTextTypes.includes(node.type) || isTabList(node)) continue

        const item = items.get(node)
        if (item) {
          active = item // its own text is its title, not content
        } else if (node.type === 'text') {
          if (active) active.content += node.value
        } else if (node.children) {
          const isComponent = node.type === 'mdxJsxFlowElement'

          if (isComponent) separate(active)
          walk(node, active)
          if (isComponent) separate(active)
        }
      }
    }
    walk(root, null)
  }
}
