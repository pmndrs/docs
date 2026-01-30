import type { Doc, DocToC } from '@/app/[...slug]/DocsContext'
import { rehypeCodesandbox } from '@/components/mdx/Codesandbox/rehypeCodesandbox'
import { compileMdxContent, compileMdxFrontmatter } from '@/utils/compileMdxContent'
import resolveMdxUrl from '@/utils/resolveMdxUrl'
import matter from 'gray-matter'
import { compileMDX } from 'next-mdx-remote/rsc'
import fs from 'node:fs'
import { cache } from 'react'

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
 * Parses docs metadata from a given root directory.
 */
export async function parseDocsMetadata(root: string) {
  const files = await crawl(
    root,
    (dir) => !dir.includes('node_modules') && MARKDOWN_REGEX.test(dir),
  )

  const docs = await Promise.all(
    files.map(async (file) => {
      const path = file.replace(`${root}/`, '')
      const slug = [...path.replace(MARKDOWN_REGEX, '').toLowerCase().split('/')]
      const url = `/${slug.join('/')}`

      const str = await fs.promises.readFile(file, { encoding: 'utf-8' })
      const compiled = matter(str)
      const frontmatter = compiled.data
      const content = compiled.content

      const title: string = frontmatter.title?.trim() ?? slug[slug.length - 1].replace(/\-/g, ' ')
      const description: string = frontmatter.description ?? ''
      const nav: number = frontmatter.nav ?? Infinity

      return {
        file,
        url,
        slug,
        title,
        description,
        nav,
        content,
        frontmatter,
      }
    }),
  )

  return docs.sort((a, b) => a.nav - b.nav)
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
  //
  // 1st pass for `entries` - using shared parseDocsMetadata
  //

  const parsedDocs = await parseDocsMetadata(root)

  const entries = await Promise.all(
    parsedDocs.map(async (parsed) => {
      const { file, slug, url, title, frontmatter, content } = parsed

      const boxes: string[] = []

      // Sanitize markdown
      const sanitizedContent = content
        // Remove inline link syntax
        .replace(INLINE_LINK_REGEX, '$1')

      await compileMDX({
        source: sanitizedContent,
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
        content: sanitizedContent,
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

        // Keep description as string for metadata (SEO)
        const description: string = frontmatter.description ?? ''

        // Compile frontmatter description as MDX for display (only if it contains MDX syntax)
        const needsMdxCompilation = /[*`[\]_]/.test(description)
        const compiledDescription =
          description && needsMdxCompilation
            ? await compileMdxFrontmatter(description, relFilePath, MDX_BASEURL)
            : null
        const descriptionJsx = compiledDescription?.content

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

        const { content: jsx } = await compileMdxContent(
          `# ${title}\n ${content}`,
          relFilePath,
          file,
          MDX_BASEURL,
          title,
          url,
          tableOfContents,
          entries,
        )

        return {
          slug,
          url,
          editURL,
          sourcecode,
          sourcecodeURL,
          title,
          image,
          description,
          descriptionJsx,
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
