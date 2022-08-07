import { fs } from 'memfs'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import matter from 'gray-matter'
import libs from 'data/libraries'

/**
 * Checks for .md(x) file extension
 */
export const MARKDOWN_REGEX = /\.mdx?$/

/**
 * Uncomments frontMatter from vanilla markdown
 */
export const FRONTMATTER_REGEX = /^<!--[\s\n]*?(?=---)|(?!---)[\s\n]*?-->/g

/**
 * Removes multi and single-line comments from markdown
 */
export const COMMENT_REGEX = /<!--(.|\n)*?-->|<!--[^\n]*?\n/g

/**
 * Recursively crawls a directory, returning an array of file paths.
 */
const crawl = async (dir: string, filter?: RegExp, files: string[] = []) => {
  if (fs.lstatSync(dir).isDirectory()) {
    const filenames = fs.readdirSync(dir)
    await Promise.all(filenames.map(async (filename) => crawl(`${dir}/${filename}`, filter, files)))
  } else if (!filter || filter.test(dir)) {
    files.push(dir)
  }

  return files
}

/**
 * Gets a lib's doc params if configured.
 */
const getParams = (lib: keyof typeof libs) => {
  const config = libs[lib]
  if (!config?.docs) return

  const [user, repo, branch, ...rest] = config.docs.split('/')
  const dir = rest.join('/')

  const gitDir = `/${user}-${repo}-${branch}`
  const entry = dir ? `${gitDir}/${dir}` : gitDir

  return { user, repo, branch, gitDir, entry }
}

export interface Doc {
  slug: string[]
  url: string
  editURL: string
  nav: number
  title: string
  description: string
  content: string
}

/**
 * Fetches all docs, filters to a lib if specified.
 */
export const getDocs = async (lib?: keyof typeof libs): Promise<Doc[]> => {
  // If a lib isn't specified, fetch all docs
  if (!lib) {
    const docs = await Promise.all(Object.keys(libs).map(getDocs))
    return docs.filter(Boolean).flat()
  }

  // Init params, bail if lib not found
  const params = getParams(lib)
  if (!params) return

  // Clone remote
  await git.clone({
    fs,
    http,
    dir: params.gitDir,
    url: `https://github.com/${params.user}/${params.repo}`,
    ref: params.branch,
    singleBranch: true,
    depth: 1,
  })

  // Crawl and parse docs
  const files = await crawl(params.entry, MARKDOWN_REGEX)

  const docs = files
    .map((file) => {
      // Get slug from local path
      const path = file.replace(`${params.entry}/`, '')
      const slug = [lib, ...path.replace(MARKDOWN_REGEX, '').toLowerCase().split('/')]
      const url = `/${slug.join('/')}`
      const editURL = file.replace(
        params.gitDir,
        `https://github.com/${params.user}/${params.repo}/tree/${params.branch}`
      )

      // Read & parse doc
      const compiled = matter(fs.readFileSync(file))

      // Add fallback frontmatter
      const pathname = slug[slug.length - 1]
      const title = compiled.data.title ?? pathname.replace(/\-/g, ' ')
      const description = compiled.data.description ?? ''
      const nav = compiled.data.nav ?? Infinity

      // Sanitize markdown
      const content = compiled.content
        // Remove <!-- --> comments from frontMatter
        .replace(FRONTMATTER_REGEX, '')
        // Remove extraneous comments from post
        .replace(COMMENT_REGEX, '')

      return { slug, url, editURL, title, description, nav, content }
    })
    .sort((a, b) => (a.nav > b.nav ? 1 : -1))

  return docs
}
