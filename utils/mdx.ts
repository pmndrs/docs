/**
 * Uncomments frontMatter from vanilla markdown
 */
export const FRONTMATTER_REGEX = /^<!--[\s\n]*?(?=---)|(?!---)[\s\n]*?-->/g

/**
 * Removes multi and single-line comments from markdown
 */
export const COMMENT_REGEX = /<!--(.|\n)*?-->|<!--[^\n]*?\n/g

/**
 * Sanitizes doc markdown by removing extraneous or error-prone syntax.
 */
export const sanitize = (mdx: string) =>
  mdx
    // Remove <!-- --> comments from frontMatter
    .replace(FRONTMATTER_REGEX, '')
    // Remove extraneous comments from post
    .replace(COMMENT_REGEX, '')

/**
 * Checks whether path matches doc markdown.
 */
export const isDoc = (path: string, dir?: string) =>
  path.endsWith('.mdx') && (!dir || path.startsWith(dir))
