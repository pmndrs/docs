import { join, sep } from 'path'
import { readFileSync } from 'fs'
import matter from 'gray-matter'
import recursiveReaddir from 'recursive-readdir'

/**
 * Checks for the MDX file extension
 */
export const MARKDOWN_REGEX = /\.mdx?$/

/**
 * Useful when you want to get the path to a specific file
 */
export const DOCS_PATH = join(process.cwd(), 'docs')

/**
 * Gets a list of all mdx files inside the `DOCS_PATH` directory
 */
export const getDocsPaths = async () => {
  const paths = ((await recursiveReaddir(DOCS_PATH)) as string[])
    // Filter to only doc markdown
    .filter((path) => MARKDOWN_REGEX.test(path))
    // Get local path
    .map((path) => path.replace(process.cwd(), ''))
    // Remove file extensions for page paths
    .map((path) => path.replace(MARKDOWN_REGEX, ''))
    // Remove redundant docs prefix
    .map((path) => path.replace(`${sep}docs`, ''))

  return paths
}

/**
 * Gets a list of all docs and their meta in the `DOCS_PATH` directory
 */
export const getAllDocs = async () => {
  const docs = (await getDocsPaths())
    .map((path) => {
      // Get frontMatter from markdown
      const source = readFileSync(join(DOCS_PATH, `${path}.mdx`))
      const { data, content } = matter(source)
      // Normalize paths for web
      const url = path.replace(/\\/g, '/')

      // Get URL pathname
      const pathname = url.split('/').pop()
      const folder = url.split('/')[2]

      return {
        url,
        title: data.title || pathname.replace(/\-/g, ' '),
        nav: data.nav ?? Infinity,
        content,
      }
    })
    .sort((a, b) => (a.nav > b.nav ? 1 : -1))
  return docs
}
