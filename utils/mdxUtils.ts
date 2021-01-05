import path from 'path'
import fs from 'fs'
import matter from 'gray-matter'
import recursiveReaddir from 'recursive-readdir'

// DOCS_PATH is useful when you want to get the path to a specific file
export const DOCS_PATH = path.join(process.cwd(), 'docs')

// postFilePaths is the list of all mdx files inside the DOCS_PATH directory
export const getDocsPaths = async () =>
  (await recursiveReaddir(DOCS_PATH))
    .map((path) => path.replace(process.cwd(), ''))
    .filter((path) => /\.mdx?$/.test(path))

export async function getAllDocs() {
  const files = (await recursiveReaddir(DOCS_PATH))
    .filter((x) => x.indexOf('.mdx') > -1)
    .map((filePath) => {
      const url = filePath.replace(process.cwd(), '').replace('.mdx', '').replace('/docs/', '')
      const source = fs.readFileSync(filePath)
      const { data } = matter(source)

      return {
        url,
        title: data.title || url.split('/').pop().split('-').join(' '),
        nav: data.nav ?? Infinity,
      }
    })
    .sort((a, b) => (a.nav > b.nav ? 1 : -1))

  return files
}
