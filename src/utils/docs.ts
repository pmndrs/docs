import { fs } from 'memfs'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import matter from 'gray-matter'
import libs from 'data/libraries'
import type { Doc, DocToC } from 'hooks/useDocs'
import { sanitize, slugify } from './text'

/**
 * Checks for .md(x) file extension
 */
const MARKDOWN_REGEX = /\.mdx?$/

/**
 * Uncomments frontMatter from vanilla markdown
 */
const FRONTMATTER_REGEX = /^<!--[\s\n]*?(?=---)|(?!---)[\s\n]*?-->/g

/**
 * Removes multi and single-line comments from markdown
 */
const COMMENT_REGEX = /<!--(.|\n)*?-->|<!--[^\n]*?\n/g

/**
 * Recursively crawls a directory, returning an array of file paths.
 */
async function crawl(dir: string, filter?: RegExp, files: string[] = []) {
  if (fs.lstatSync(dir).isDirectory()) {
    const filenames = fs.readdirSync(dir) as string[]
    await Promise.all(filenames.map(async (filename) => crawl(`${dir}/${filename}`, filter, files)))
  } else if (!filter || filter.test(dir)) {
    files.push(dir)
  }

  return files
}

/**
 * Fetches all docs, filters to a lib if specified.
 */
export async function getDocs(lib?: keyof typeof libs): Promise<Doc[]> {
  // If a lib isn't specified, fetch all docs
  if (!lib) {
    const docs = await Promise.all(
      Object.keys(libs)
        .filter((lib) => libs[lib].docs)
        .map(getDocs)
    )
    return docs.filter(Boolean).flat()
  }

  const config = libs[lib]
  const [user, repo, branch, ...rest] = config.docs!.split('/')

  const dir = `/${user}-${repo}-${branch}`
  const root = `${dir}/${rest.join('/')}`

  // Clone remote
  await git.clone({
    fs,
    http,
    dir,
    url: `https://github.com/${user}/${repo}`,
    ref: branch,
    singleBranch: true,
    depth: 1,
  })

  // Crawl and parse docs
  const files = await crawl(root, MARKDOWN_REGEX)

  const docs = await Promise.all(
    files.map(async (file) => {
      // Get slug from local path
      const path = file.replace(`${root}/`, '')
      const slug = [lib, ...path.replace(MARKDOWN_REGEX, '').toLowerCase().split('/')]
      const url = `/${slug.join('/')}`
      const editURL = file.replace(dir, `https://github.com/${user}/${repo}/tree/${branch}`)

      // Read & parse doc
      const compiled = matter(await fs.promises.readFile(file))

      // Add fallback frontmatter
      const pathname = slug[slug.length - 1]
      const title = sanitize(compiled.data.title ?? pathname.replace(/\-/g, ' '))
      const description = sanitize(compiled.data.description ?? '')
      const nav = compiled.data.nav ?? Infinity

      // Sanitize markdown
      const content = compiled.content
        // Remove <!-- --> comments from frontMatter
        .replace(FRONTMATTER_REGEX, '')
        // Remove extraneous comments from post
        .replace(COMMENT_REGEX, '')
        // Require inline images
        .replace(/(src="|\()([^\.]+\.(?:png|jpg))("|\))/g, (input, prefix, src, suffix) => {
          const parts = file.split('/')
          parts.pop()

          const url = `${parts.join('/')}/${src}`
          if (!fs.existsSync(url)) return input

          const type = src.endsWith('.jpg') ? 'jpg' : 'png'
          return `${prefix}data:image/${type};base64,${fs.readFileSync(url, 'base64')}${suffix}`
        })

      const headings = content.matchAll(/^#{1,4}\s[^\n]+/gm)
      const previous: Record<number, DocToC> = {}

      const tableOfContents: DocToC[] = []

      for (const match of headings) {
        const [heading] = match
        const [prefix, ...rest] = heading.trim().split(' ')
        const level = prefix.length
        const title = sanitize(rest.join(' '))
        const id = slugify(title)

        const description = sanitize(
          content
            .substring(match.index!)
            .match(/^(\n|\s)*^\w[^\n]+/m)?.[0]
            .trim() ?? ''
        )

        const item: DocToC = {
          level,
          title,
          id,
          url: `${url}#${id}`,
          description,
          parent: previous[level - 2] ?? null,
        }
        previous[level - 1] = item

        tableOfContents.push(item)
      }

      return { slug, url, editURL, title, description, nav, content, tableOfContents }
    })
  )

  return docs.sort((a, b) => a.nav - b.nav)
}
