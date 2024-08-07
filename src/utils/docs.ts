import { fs } from 'memfs'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGFM from 'remark-gfm'
import rehypePrismPlus from 'rehype-prism-plus'
import { codesandbox, toc } from 'utils/rehype'
import libs from 'data/libraries'
import type { Doc, DocToC } from 'hooks/useDocs'

/**
 * Checks for .md(x) file extension
 */
export const MARKDOWN_REGEX = /\.mdx?/

/**
 * Uncomments frontMatter from vanilla markdown
 */
const FRONTMATTER_REGEX = /^<!--[\s\n]*?(?=---)|(?!---)[\s\n]*?-->/g

/**
 * Removes multi and single-line comments from markdown
 */
const COMMENT_REGEX = /<!--(.|\n)*?-->|<!--[^\n]*?\n/g

/**
 * Removes <https://inline.links> formatting from markdown
 */
const INLINE_LINK_REGEX = /<(http[^>]+)>/g

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
export async function getDocs(
  lib: keyof typeof libs | undefined,
  onlySlug: boolean
): Promise<Doc[]> {
  // If a lib isn't specified, fetch all docs
  if (!lib) {
    const docs = await Promise.all(
      Object.keys(libs)
        .filter((lib) => libs[lib].docs)
        .map((lib) => getDocs(lib, onlySlug))
    )
    return docs.filter(Boolean).flat()
  }

  const libDocs = libs[lib].docs
  if (!libDocs) return []
  const [user, repo, branch, ...rest] = libDocs.split('/')

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
      if (onlySlug) {
        return { slug } as any
      }
      const url = `/${slug.join('/')}`
      const editURL = file.replace(dir, `https://github.com/${user}/${repo}/tree/${branch}`)

      // Read & parse doc
      const compiled = matter(await fs.promises.readFile(file))

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
        // Remove inline link syntax
        .replace(INLINE_LINK_REGEX, '$1')
        // Require inline images
        .replace(
          /(src="|\()(.+?\.(?:png|jpe?g|gif|webp|avif))("|\))/g,
          (_input, prefix, src, suffix) => {
            if (src.includes('//')) return `${prefix}${src}${suffix}`

            const [, _dir, ...parts] = file.split('/')
            parts.pop() // remove MDX file from path

            const url = `https://github.com/${user}/${repo}/raw/${branch}/${parts.join('/')}/${src}`

            return `${prefix}${url}${suffix}`
          }
        )

      const boxes: string[] = []
      const tableOfContents: DocToC[] = []

      const source = await serialize(content, {
        mdxOptions: {
          remarkPlugins: [remarkGFM],
          rehypePlugins: [
            rehypePrismPlus,
            codesandbox(boxes),
            toc(tableOfContents, url, title, content),
          ],
        },
      })

      return {
        slug,
        url,
        editURL,
        title,
        description,
        nav,
        source,
        boxes,
        tableOfContents,
      }
    })
  )

  return docs.sort((a, b) => a.nav - b.nav)
}
