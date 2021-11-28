import slugify from '@sindresorhus/slugify'

interface Node {
  type: string
  value: string
  depth: number
  children: Node[]
}

/**
 * Replaces codesandbox iframes with a custom Codesandbox component.
 */
export const withCodesandbox = () => {
  return (tree: Node) => {
    tree.children.forEach((node) => {
      if (node.type === 'jsx' && node.value.match(/iframe/) && node.value.match(/codesandbox/)) {
        const url = node.value.match(/(?<=src=").*?(?=[\"])/)[0]
        node.value = `<Codesandbox url={"${url}"} />`
      }
    })
  }
}

interface TOCItem {
  slug: string
  title: string
  label: string
  depth: number
}

/**
 * Generates a table of contents from page headings.
 */
export const withTableofContents = (toc: TOCItem[]) => {
  return () => (tree: Node) => {
    const parents: string[] = []

    tree.children.forEach((node) => {
      if (node.type === 'heading' && [2, 3, 4].includes(node.depth)) {
        // Filter out decorative-only children
        const children = node.children.filter((n) => ['text', 'inlineCode'].includes(n.type))

        // Cleanup title
        const title = children
          .map((n) =>
            n.type === 'inlineCode'
              ? // Cleanup links for code-only titles
                n.value.replace(/^(get|set)\s|\(.+|\??\:.+/g, '')
              : n.value
          )
          .join('')
        const slug = slugify(title)

        // Preserve non-text nodes
        const content = children
          .map((n) => (n.type === 'text' ? n.value : `<${n.type}>{'${n.value}'}</${n.type}>`))
          .join('')

        // Find duplicate heading links
        const isDuplicate = toc.find((previous) => previous.slug === slug)
        const isParent = node.depth === 2

        const parent = parents.length && parents[parents.length - 1]
        const label = isParent || !parent ? slug : `${parent} - ${slug}`

        // Handle duplicates
        if (isDuplicate) {
          node.type = 'jsx'
          node.value = `<Heading aria-label="${label}" level={${node.depth}}>${content}</Heading>`
        } else {
          node.type = 'jsx'
          node.value = `<Heading id="${slug}" aria-label="${label}" level={${node.depth}}>${content}</Heading>`

          toc.push({ slug, title, label, depth: node.depth })
        }

        // Element is an H2, parent elements following it
        if (node.depth === 2) parents.push(label)
      }
    })

    return tree
  }
}
