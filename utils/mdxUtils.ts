import path from 'path'
import recursiveReaddir from 'recursive-readdir'

// DOCS_PATH is useful when you want to get the path to a specific file
export const DOCS_PATH = path.join(process.cwd(), 'docs')

// postFilePaths is the list of all mdx files inside the DOCS_PATH directory
export const getDocsPaths = async () =>
  (await recursiveReaddir(DOCS_PATH))
    .map((path) => path.replace(process.cwd(), ''))
    .filter((path) => /\.mdx?$/.test(path))
