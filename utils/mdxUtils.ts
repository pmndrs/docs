import path from 'path'
import fs from 'fs'
import matter from 'gray-matter'
import recursiveReaddir from 'recursive-readdir'

/**
 * Useful when you want to get the path to a specific file
 */
export const DOCS_PATH = path.join(process.cwd(), 'docs')

/**
 * Gets a list of all mdx files inside the `DOCS_PATH` directory
 */
export const getDocsPaths = async () =>
  ((await recursiveReaddir(DOCS_PATH)) as string[])
    // Filter to only doc markdown
    .filter((path) => /\.mdx?$/.test(path))
    // Get local path
    .map((path) => path.replace(process.cwd(), ''))
    // Remove file extensions for page paths
    .map((path) => path.replace(/\.mdx?$/, ''))
    // Remove redundant docs prefix
    .map((path) => path.replace(/[/\\]?docs/i, ''))

/**
 * Gets a list of all docs and their meta in the `DOCS_PATH` directory
 */
export async function getAllDocs() {
  const files = (await getDocsPaths())
    .map((url) => {
      const source = fs.readFileSync(path.join(DOCS_PATH, `${url}.mdx`))
      const { data } = matter(source)

      return {
        url,
        title: data.title || url.split(path.sep).pop().split('-').join(' '),
        nav: data.nav ?? Infinity,
      }
    })
    .sort((a, b) => (a.nav > b.nav ? 1 : -1))

  return files
}
