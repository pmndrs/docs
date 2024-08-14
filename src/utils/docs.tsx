import fs from 'node:fs'
import matter from 'gray-matter'

import type { Doc, DocToC } from '@/app/[...slug]/DocsContext'
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

const INLINE_IMAGES_BASEURL = process.env.INLINE_IMAGES_BASEURL
// console.log('INLINE_IMAGES_BASEURL', INLINE_IMAGES_BASEURL)

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

      // editURL
      const EDIT_BASEURL = process.env.EDIT_BASEURL
      const editURL = EDIT_BASEURL?.length ? file.replace(root, EDIT_BASEURL) : undefined

      // Read & parse doc
      const compiled = matter(await fs.promises.readFile(file))

      // Add fallback frontmatter
      const pathname = slug[slug.length - 1]
      const title = compiled.data.title ?? (pathname.replace(/\-/g, ' ') as string)
      const description = compiled.data.description ?? ('' as string)
      const nav = compiled.data.nav ?? (Infinity as number)
      const image = compiled.data.image as string | undefined

      //
      // MDX content
      //

      // Skip docs other than `slugOfInterest` -- better perfs)
      // if (JSON.stringify(slug) !== JSON.stringify(slugOfInterest)) {
      //   return {
      //     slug,
      //     url,
      //     editURL,
      //     title,
      //     description,
      //     nav,
      //   } as Doc
      // }

      // Sanitize markdown
      let content = compiled.content
        // Remove <!-- --> comments from frontMatter
        .replace(FRONTMATTER_REGEX, '')
        // Remove extraneous comments from post
        .replace(COMMENT_REGEX, '')
        // Remove inline link syntax
        .replace(INLINE_LINK_REGEX, '$1')

      //
      // inline images
      //

      function inlineImage(src: string, baseurl: string) {
        if (src.startsWith('http')) return src // Keep as is, in those cases

        // Eg:
        //
        // src: "./basic-example.gif"
        // baseurl: "http://localhost:60141/foo"
        //
        // file: "/Users/abernier/code/pmndrs/uikit/docs/advanced/performance.md"
        // root: "/Users/abernier/code/pmndrs/uikit/docs"
        //

        let directoryPath = ''

        // Relative (not starting with "/") => get directoryPath from file
        if (!src.startsWith('/')) {
          const normalizedRoot = root.endsWith('/') ? root.slice(0, -1) : root // Remove trailing slash (if exists)
          const relativePath = file.substring(normalizedRoot.length) // "/advanced/performance.md"
          directoryPath = relativePath.split('/').slice(0, -1).join('/') // "/advanced"
        }

        // console.log('url', baseurl, directoryPath, src)
        return `${baseurl}${directoryPath}/${src}` // "http://localhost:60141/foo/advanced/./basic-example.gif"
      }

      if (INLINE_IMAGES_BASEURL) {
        content = content.replace(
          /(src="|\()(.+?\.(?:png|jpe?g|gif|webp|avif))("|\))/g, // https://regexper.com/#%2F%28src%3D%22%7C%5C%28%29%28.%2B%3F%5C.%28%3F%3Apng%7Cjpe%3Fg%7Cgif%7Cwebp%7Cavif%29%29%28%22%7C%5C%29%29%2Fg
          (_input, prefix: string, src: string, suffix: string) => {
            const url = inlineImage(src, INLINE_IMAGES_BASEURL)
            return `${prefix}${url}${suffix}`
          }
        )
      }

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

      const metadataImage =
        image && INLINE_IMAGES_BASEURL ? inlineImage(image, INLINE_IMAGES_BASEURL) : undefined

      return {
        slug,
        url,
        editURL,
        title,
        metadataImage,
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
