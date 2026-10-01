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
  (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
  node.name === 'TabsList'

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
 *
 * A heading's `parent` is the closest previous heading with a lower level (as `withDepth`). A
 * heading in a component is the parent of deeper headings in that component only: after the
 * component, the headings before it are parents again.
 */
export const rehypeToc = (target: DocToC[] = [], url: string, page: string) => {
  return () => (root: Node) => {
    const items = new Map<Node, DocToC>()

    // The ids taken, each with the number of times it was asked for again (github-slugger's
    // algorithm): "Foo", "Foo", "Foo 1" give `foo`, `foo-1`, `foo-1-1`
    const occurrences = new Map<string, number>()

    const uniqueId = (slug: string) => {
      let id = slug
      while (occurrences.has(id)) {
        const count = (occurrences.get(slug) ?? 0) + 1
        occurrences.set(slug, count)
        id = `${slug}-${count}`
      }
      occurrences.set(id, 0)
      return id
    }

    //
    // Every heading of the page, in document order
    //

    // `ancestors`: the headings the next one can be nested in, outermost first
    const visitHeadings = (node: Node, ancestors: DocToC[]) => {
      if (isHeading(node)) {
        const level = parseInt(node.tagName[1]) - 1

        const title = toString(node)
        const id = uniqueId(slugify(title))
        node.properties.id = id

        while (ancestors.length > 0 && ancestors[ancestors.length - 1].level >= level) {
          ancestors.pop()
        }

        const item: DocToC = {
          id,
          level,
          label: page,
          url: `${url}#${id}`,
          title,
          content: '',
          parent: ancestors[ancestors.length - 1] ?? null,
        }
        ancestors.push(item)

        target.push(item)
        items.set(node, item)
      }

      // A component's own copy: the headings in it don't parent the ones after it
      const childAncestors = node.type === 'mdxJsxFlowElement' ? [...ancestors] : ancestors
      node.children?.forEach((child) => visitHeadings(child, childAncestors))
    }
    visitHeadings(root, [])

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
