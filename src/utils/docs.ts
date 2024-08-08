import { fs } from 'memfs'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import matter from 'gray-matter'

import libs, { Lib } from '@/data/libraries'
import type { Doc, DocToC } from '../app/[...slug]/DocsContext'
import pMemoize from 'p-memoize'
import { cache } from 'react'
import { type CSB } from '@/components/Codesandbox'

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

async function _getDocs(lib: Lib): Promise<Doc[]> {
  console.log('getDocs', lib)

  const libDocs = libs[lib].docs
  if (!libDocs) throw new Error(`No docs found for ${lib}`)

  const [user, repo, branch, ...rest] = libDocs.split('/')

  const dir = `/${user}-${repo}-${branch}`
  const root = `${dir}/${rest.join('/')}`
  const url = `https://github.com/${user}/${repo}`

  // console.log('cloning', url)

  // Clone remote
  await git.clone({
    fs,
    http,
    dir,
    url,
    ref: branch,
    singleBranch: true,
    depth: 1,
  })

  // console.log('cloned', url)

  // Crawl and parse docs
  const files = await crawl(root, MARKDOWN_REGEX)
  // console.log('files', files)

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

      return {
        slug,
        url,
        editURL,
        title,
        description,
        nav,
        content,
        boxes,
        tableOfContents,
      }
    })
  )

  // console.log('docs', docs)

  docs.sort(({ nav: navA = 0 }, { nav: navB = 0 }) => navA - navB)

  return docs
}
// export const getDocs = pMemoize(_getDocs, { cacheKey: ([lib]) => lib })
export const getDocs = cache(_getDocs)

// export const getDocs = cache(_getDocs)

async function _getData(...slug: string[]) {
  console.log('getData', slug)

  const [lib] = slug

  const docs = await getDocs(lib as Lib)
  // console.log('allDocs', allDocs)

  const url = `/${slug.join('/')}`.toLowerCase()
  // console.log('url', url)
  const doc = docs.find((doc) => doc.url === url)
  // console.log('doc', doc)

  return {
    docs,
    doc,
  }
}
export const getData = cache(_getData)
