import slugify from '@sindresorhus/slugify'

/**
 * Generates a table of contents by parsing a node tree
 * @param [toc] An array to push table contents to.
 */
const withTableofContents = (toc?: any[]) => {
  return () => (tree) => {
    // @ts-ignore
    const parents = []
    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i]
      if (node.type === 'heading' && [2, 3, 4].includes(node.depth)) {
        const children = node.children.filter((n) => ['text', 'inlineCode'].includes(n.type))

        const title = children
          .map((n) =>
            n.type === 'inlineCode'
              ? // Cleanup links for code-only titles
                n.value.replace(/^(get|set)\s|\(.+|\??\:.+/g, '')
              : n.value
          )
          .join('')
        const slug = slugify(title)

        const content = children
          .map((n) => (n.type === 'text' ? n.value : `<${n.type}>{'${n.value}'}</${n.type}>`))
          .join('')

        const isDuplicate = toc.find((previous) => previous.slug === slug)
        const isParent = node.depth === 2

        const parent = parents?.length && parents[parents.length - 1]
        const label = isParent || !parent ? slug : `${parent} - ${slug}`

        // Remove duplicate heading links
        if (isDuplicate) {
          node.type = 'jsx'
          node.value = `<Heading aria-label="${label}" level={${node.depth}}>${content}</Heading>`
        } else {
          node.type = 'jsx'
          node.value = `<Heading id="${slug}" aria-label="${label}" level={${node.depth}}>${content}</Heading>`

          toc?.push?.({ slug, title, label, depth: node.depth })
        }

        if (node.depth === 2) parents.push(label)
      }
    }

    return tree
  }
}

export default withTableofContents
