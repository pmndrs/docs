import fs from 'node:fs'
import matter from 'gray-matter'

import type { Doc, DocToC } from '@/app/[[...slug]]/DocsContext'
import pMemoize from 'p-memoize'
import { cache } from 'react'

import { compileMDX } from 'next-mdx-remote/rsc'
import { MDXRemote } from 'next-mdx-remote'
import remarkGFM from 'remark-gfm'
import rehypePrismPlus from 'rehype-prism-plus'
import { codesandbox, toc } from '@/utils/rehype'
import Codesandbox, { fetchCSB } from '@/components/Codesandbox'

import * as components from '@/components/mdx'

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
 *
 * @param root - absolute or relative (to cwd) path to docs folder
 */

async function _getDocs(
  root: string,
  slugOfInterest: string[] | null,
  slugOnly = false
): Promise<Doc[]> {
  const files = await crawl(root, MARKDOWN_REGEX)
  // console.log('files', files)

  const docs = await Promise.all(
    files.map(async (file) => {
      // Get slug from local path
      const path = file.replace(`${root}/`, '')
      const slug = [...path.replace(MARKDOWN_REGEX, '').toLowerCase().split('/')]

      //
      // "Lightest" version of the doc (for `generateStaticParams`)
      //

      if (slugOnly) {
        return { slug } as Doc
      }

      //
      // Common infos (for every `docs`)
      //

      const url = `/${slug.join('/')}`
      // const editURL = file.replace(root, `https://github.com/pmndrs/${lib}`)

      // Read & parse doc
      const compiled = matter(await fs.promises.readFile(file))

      // Add fallback frontmatter
      const pathname = slug[slug.length - 1]
      const title = compiled.data.title ?? pathname.replace(/\-/g, ' ')
      const description = compiled.data.description ?? ''
      const nav = compiled.data.nav ?? Infinity

      if (JSON.stringify(slug) !== JSON.stringify(slugOfInterest)) {
        return {
          slug,
          url,
          // editURL,
          title,
          description,
          nav,
        } as Doc
      }

      //
      // With MDX content (only for `theSlug` doc we are interested in -- better perfs)
      //

      // Sanitize markdown
      const content = compiled.content
        // Remove <!-- --> comments from frontMatter
        .replace(FRONTMATTER_REGEX, '')
        // Remove extraneous comments from post
        .replace(COMMENT_REGEX, '')
        // Remove inline link syntax
        .replace(INLINE_LINK_REGEX, '$1')

      const boxes: string[] = []
      const tableOfContents: DocToC[] = []

      const { content: jsx } = await compileMDX({
        source: content,
        options: {
          mdxOptions: {
            remarkPlugins: [remarkGFM],
            rehypePlugins: [
              rehypePrismPlus,
              codesandbox(boxes), // 1. put all Codesandbox[id] into `doc.boxes`
              toc(tableOfContents, url, title, content), // 2. will populate `doc.tableOfContents`
            ],
          },
        },
        components: {
          ...(components as React.ComponentProps<typeof MDXRemote>['components']),
          Codesandbox: async (props: React.ComponentProps<typeof Codesandbox>) => {
            const ids = boxes // populated from 1.
            // console.log('ids', ids)

            //
            // Batch fetch all CSBs of the page
            //
            const csbs = await fetchCSB(...ids)
            // console.log('boxes', boxes)
            const data = csbs[props.id]
            // console.log('data', data)

            // Merge initial props with data
            const merged = { ...props, ...data }
            return <Codesandbox {...merged} />
          },
        },
      })

      return {
        slug,
        url,
        // editURL,
        title,
        description,
        nav,
        content: jsx,
        boxes,
        tableOfContents,
      }
    })
  )
  // console.log('docs', docs)

  return docs.sort((a, b) => a.nav - b.nav)
}
// export const getDocs = pMemoize(_getDocs, { cacheKey: ([lib]) => lib })
export const getDocs = cache(_getDocs)

// export const getDocs = cache(_getDocs)

async function _getData(...slug: string[]) {
  // console.log('getData', slug)

  const { MDX } = process.env
  if (!MDX) throw new Error('MDX env var not set')

  const docs = await getDocs(MDX, slug)
  // console.log('allDocs', docs)

  const url = `/${slug.join('/')}`.toLowerCase()
  // console.log('url', url)
  const doc = docs.find((doc) => doc.url === url)
  // console.log('doc', doc)

  if (!doc) throw new Error(`Doc not found: ${url}`)

  return {
    docs,
    doc,
  }
}
export const getData = cache(_getData)
