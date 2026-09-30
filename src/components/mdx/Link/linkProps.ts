const MARKDOWN_REGEX = /\.mdx?/

/**
 * The `href`, `target` and `rel` of a link written in MDX: an external one opens in a new
 * tab, an internal one loses its `.md`/`.mdx` extension.
 */
export function linkProps(href?: string, target?: string, rel?: string) {
  const isAnchor = href?.startsWith('https://')
  target = isAnchor ? '_blank' : target
  rel = isAnchor ? 'noopener noreferrer' : rel
  href = isAnchor ? href : href?.replace(MARKDOWN_REGEX, '')

  return { href, target, rel }
}
