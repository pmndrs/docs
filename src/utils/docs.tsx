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

const components = {
  Codesandbox,
  Hint: ({ children }: { children: React.ReactNode }) => (
    <div className="hint shadow overflow-hidden bg-yellow-100 border-b border-gray-200 sm:rounded-lg px-6 py-4 mb-6 dark:text-gray-500">
      {children}
    </div>
  ),
  Grid: ({ children, cols = 4 }: { children: React.ReactNode; cols?: number }) => (
    <ul
      className={`grid sm:grid-cols-2 ${
        cols === 4
          ? 'md:grid-cols-4'
          : cols === 3
          ? 'md:grid-cols-3'
          : cols === 2
          ? 'md:grid-cols-2'
          : 'md:grid-cols-1'
      } gap-4 text-sm text-gray-700 grid-list`}
      style={{ marginBottom: '1rem' }}
    >
      {children}
    </ul>
  ),
  h2: ({ children, id }: { children: React.ReactNode; id: string }) => (
    <a href={`#${id}`} className="heading text-3xl mb-6 mt-8 tracking-light">
      <h2 id={id}>{children}</h2>
    </a>
  ),
  h3: ({ children, id }: { children: React.ReactNode; id: string }) => (
    <a href={`#${id}`} className="heading text-xl mb-4 mt-6 tracking-light">
      <h3 id={id}>{children}</h3>
    </a>
  ),
  h4: ({ children, id }: { children: React.ReactNode; id: string }) => (
    <a href={`#${id}`} className="heading text-base mb-4 mt-4 tracking-light">
      <h4 id={id}>{children}</h4>
    </a>
  ),
  ul: ({ children }: { children: React.ReactNode }) => <ul className="px-4 mb-8">{children}</ul>,
  ol: ({ children }: { children: React.ReactNode }) => <ol className="px-4 mb-8">{children}</ol>,
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="mb-4 text-base leading-6 text-gray-700 dark:text-gray-400">{children}</li>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-4 text-base text-gray-700 dark:text-gray-400">{children}</p>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="mb-8 text-base pl-4 border-l-4 border-gray-600">{children}</blockquote>
  ),
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col my-6">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-6 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow-lg overflow-hidden border-b border-gray-200 sm:rounded-lg dark:border-gray-700">
            <table className="divide-y divide-gray-200 w-full dark:divide-gray-700">
              {children}
            </table>
          </div>
        </div>
      </div>
    </div>
  ),
  a: ({
    href,
    target,
    rel,
    children,
  }: {
    href: string
    target?: string
    rel?: string
    children: React.ReactNode
  }) => {
    const isAnchor = href.startsWith('https://')
    target = isAnchor ? '_blank' : target
    rel = isAnchor ? 'noopener noreferrer' : rel
    href = isAnchor ? href : href.replace(MARKDOWN_REGEX, '')
    return (
      <a href={href} target={target} rel={rel}>
        {children}
      </a>
    )
  },
  img: ({
    src,
    alt,
    width,
    height,
    ...rest
  }: {
    src: string
    alt: string
    width: number
    height: number
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      decoding="async"
      loading="lazy"
      alt={alt}
      width={width}
      height={height}
      {...rest}
    />
  ),
}

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
