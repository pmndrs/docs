import slugify from '@sindresorhus/slugify'

/**
 * Generates a table of contents by parsing a node tree
 * @param [toc] An array to push table contents to.
 */
const withTableofContents = (toc?: any[]) => {
  return () => (tree) => {
    // @ts-ignore
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
        node.type = 'jsx'
        node.value = `<Heading id={"${slug}"} level={${node.depth}}>${content}</Heading>`

        if (Array.isArray(toc)) {
          toc.push({ slug, title, depth: node.depth })
        }
      }
    }

    return tree
  }
}

export default withTableofContents
