import type { Doc, DocToC } from '@/app/[...slug]/DocsContext'
import {
  a,
  blockquote,
  code,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  hr,
  li,
  ol,
  p,
  table,
  td,
  th,
  thead,
  tr,
  ul,
} from '@/components/mdx'
import { Code } from '@/components/mdx/Code'
import { rehypeCode } from '@/components/mdx/Code/rehypeCode'
import { Codesandbox1 } from '@/components/mdx/Codesandbox'
import { rehypeCodesandbox } from '@/components/mdx/Codesandbox/rehypeCodesandbox'
import { Details } from '@/components/mdx/Details'
import { rehypeDetails } from '@/components/mdx/Details/rehypeDetails'
import { Entries } from '@/components/mdx/Entries'
import { Gha } from '@/components/mdx/Gha'
import { rehypeGha } from '@/components/mdx/Gha/rehypeGha'
import { Grid } from '@/components/mdx/Grid'
import { Hint } from '@/components/mdx/Hint'
import { Img } from '@/components/mdx/Img'
import { rehypeImg } from '@/components/mdx/Img/rehypeImg'
import { Intro } from '@/components/mdx/Intro'
import { Keypoints, KeypointsItem } from '@/components/mdx/Keypoints'
import { Mermaid } from '@/components/mdx/Mermaid'
import { rehypeMermaid } from '@/components/mdx/Mermaid/rehypeMermaid'
import { Backers, Contributors } from '@/components/mdx/People'
import { Sandpack } from '@/components/mdx/Sandpack'
import { rehypeSandpack } from '@/components/mdx/Sandpack/rehypeSandpack'
import { Summary } from '@/components/mdx/Summary'
import { rehypeSummary } from '@/components/mdx/Summary/rehypeSummary'
import { Toc } from '@/components/mdx/Toc'
import { rehypeToc } from '@/components/mdx/Toc/rehypeToc'
import resolveMdxUrl from '@/utils/resolveMdxUrl'
import matter from 'gray-matter'
import { compileMDX } from 'next-mdx-remote/rsc'
import fs from 'node:fs'
import { dirname } from 'node:path'
import { cache } from 'react'
import rehypePrismPlus from 'rehype-prism-plus'
import remarkGFM from 'remark-gfm'

/**
 * Checks for .md(x) file extension
 */
export const MARKDOWN_REGEX = /\.mdx?/

/**
 * Removes <https://inline.links> formatting from markdown
 */
const INLINE_LINK_REGEX = /<(http[^>]+)>/g

/**
 * Recursively crawls a directory, returning an array of file paths.
 */
export async function crawl(dir: string, filter?: (dir: string) => boolean, files: string[] = []) {
  if (fs.lstatSync(dir).isDirectory()) {
    const filenames = fs.readdirSync(dir) as string[]
    await Promise.all(filenames.map(async (filename) => crawl(`${dir}/${filename}`, filter, files)))
  } else if (!filter || filter(dir)) {
    files.push(dir)
  }

  return files
}

/**
 * Fetches all docs, filters to a lib if specified.
 *
 * @param root - absolute or relative (to cwd) path to docs folder
 */

const MDX_BASEURL = process.env.MDX_BASEURL
// console.log('MDX_BASEURL', MDX_BASEURL)

async function _getDocs(
  root: string,
  slugOfInterest: string[] | null,
  slugOnly = false,
): Promise<Doc[]> {
  const files = await crawl(
    root,
    (dir) => !dir.includes('node_modules') && MARKDOWN_REGEX.test(dir),
  )
  // console.log('files', files)

  //
  // 1st pass for `entries`
  //

  const entries = await Promise.all(
    files.map(async (file) => {
      // Get slug from local path
      const path = file.replace(`${root}/`, '')
      const slug = [...path.replace(MARKDOWN_REGEX, '').toLowerCase().split('/')]

      const url = `/${slug.join('/')}`

      //
      // frontmatter
      //

      const str = await fs.promises.readFile(file, { encoding: 'utf-8' })
      const compiled = matter(str)
      const frontmatter = compiled.data

      const _lastSegment = slug[slug.length - 1]
      const title: string = frontmatter.title.trim() ?? _lastSegment.replace(/\-/g, ' ')

      const boxes: string[] = []

      // Sanitize markdown
      let content = compiled.content
        // Remove inline link syntax
        .replace(INLINE_LINK_REGEX, '$1')

      await compileMDX({
        source: content,
        options: {
          mdxOptions: {
            rehypePlugins: [
              rehypeCodesandbox(boxes), // 1. put all Codesandbox[id] into `boxes`
            ],
          },
        },
      })

      return {
        slug,
        url,
        title,
        boxes,
        //
        file,
        content,
        frontmatter,
      }
    }),
  )
  // console.log('entries', entries)

  //
  // 2nd pass for `docs`
  //

  const docs = await Promise.all(
    entries.map(
      async ({
        slug,
        url,
        title,
        boxes,
        // Passed from the 1st pass
        file,
        content,
        frontmatter,
      }) => {
        const relFilePath = file.substring(root.length) // "/getting-started/tutorials/store.mdx"

        //
        // "Lightest" version of the doc (for `generateStaticParams`)
        //

        if (slugOnly) {
          return { slug } as Doc
        }

        //
        // Common infos (for every `docs`)
        //

        // editURL
        const EDIT_BASEURL = process.env.EDIT_BASEURL
        const editURL = EDIT_BASEURL?.length ? file.replace(root, EDIT_BASEURL) : undefined

        //
        // frontmatter
        //

        const description: string = frontmatter.description ?? ''

        const sourcecode: string = frontmatter.sourcecode ?? ''
        const SOURCECODE_BASEURL = process.env.SOURCECODE_BASEURL
        const sourcecodeURL = SOURCECODE_BASEURL?.length
          ? `${SOURCECODE_BASEURL}/${sourcecode}`
          : undefined

        const nav: number = frontmatter.nav ?? Infinity

        const frontmatterImage: string | undefined = frontmatter.image
        const srcImage = frontmatterImage || process.env.LOGO
        const image: string = srcImage ? resolveMdxUrl(srcImage, relFilePath, MDX_BASEURL) : ''

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

        //
        // inline images
        //

        const tableOfContents: DocToC[] = []

        const { content: jsx } = await compileMDX({
          source: `# ${title}\n ${content}`,
          options: {
            mdxOptions: {
              remarkPlugins: [remarkGFM],
              rehypePlugins: [
                rehypeImg(relFilePath, MDX_BASEURL),
                rehypeDetails,
                rehypeSummary,
                rehypeGha,
                rehypeMermaid(),
                rehypePrismPlus,
                rehypeCode(),
                rehypeToc(tableOfContents, url, title), // 2. will populate `doc.tableOfContents`
                rehypeSandpack(dirname(file)),
              ],
            },
          },
          components: {
            ...{
              Code,
              Details,
              Entries,
              Gha,
              Grid,
              Hint,
              Img,
              Intro,
              Keypoints,
              KeypointsItem,
              Contributors,
              Backers,
              Mermaid,
              Sandpack,
              Summary,
              Toc,
              h1,
              h2,
              h3,
              h4,
              h5,
              h6,
              ul,
              ol,
              li,
              p,
              hr,
              blockquote,
              table,
              thead,
              th,
              tr,
              td,
              a,
              img: Img,
              code,
            },
            Codesandbox: (props) => <Codesandbox1 {...props} boxes={boxes} />,
            Entries: () => <Entries items={entries} />,
          },
        })

        return {
          slug,
          url,
          editURL,
          sourcecode,
          sourcecodeURL,
          title,
          image,
          description,
          nav,
          content: jsx,
          boxes,
          tableOfContents,
        }
      },
    ),
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
