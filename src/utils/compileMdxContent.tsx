import type { CompileMDXResult } from 'next-mdx-remote/rsc'
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
import { Codesandbox } from '@/components/mdx/Codesandbox'
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
import { rehypeLink } from '@/components/mdx/Link/rehypeLink'
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
import type { DocToC } from '@/app/[...slug]/DocsContext'
import { compileMDX } from 'next-mdx-remote/rsc'
import { dirname } from 'node:path'
import rehypePrismPlus from 'rehype-prism-plus'
import remarkGFM from 'remark-gfm'

/**
 * MDX options and components shared across the application.
 * This ensures consistent MDX rendering everywhere.
 */

/**
 * Compiles MDX content with full options (2nd pass).
 *
 * @param source - The MDX source content to compile
 * @param relFilePath - Relative file path (e.g., "/getting-started/tutorials/store.mdx")
 * @param absoluteFilePath - Absolute file path for Sandpack resolution
 * @param baseUrl - Base URL for resolving MDX URLs
 * @param title - Document title for ToC
 * @param url - Document URL for ToC
 * @param tableOfContents - Array to populate with ToC entries
 * @param entries - All doc entries for the Entries component
 * @returns Compiled MDX result with content JSX
 */
export async function compileMdxContent(
  source: string,
  relFilePath: string,
  absoluteFilePath: string,
  baseUrl: string | undefined,
  title: string,
  url: string,
  tableOfContents: DocToC[],
  entries: Array<{ slug: string[]; url: string; title: string; boxes: string[] }>,
): Promise<CompileMDXResult> {
  return await compileMDX({
    source,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGFM],
        rehypePlugins: [
          rehypeLink(process.env.BASE_PATH),
          rehypeImg(relFilePath, baseUrl),
          rehypeDetails,
          rehypeSummary,
          rehypeGha,
          rehypeMermaid(),
          rehypePrismPlus,
          rehypeCode(),
          rehypeToc(tableOfContents, url, title),
          rehypeSandpack(dirname(absoluteFilePath)),
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
      Codesandbox: (props) => <Codesandbox {...props} />,
      Entries: () => <Entries items={entries} />,
    },
  })
}

/**
 * Compiles simple MDX content (for frontmatter values).
 * Uses a minimal set of plugins suitable for inline content.
 *
 * @param source - The MDX source content to compile (e.g., frontmatter description or title)
 * @param relFilePath - Relative file path for link/image resolution
 * @param baseUrl - Base URL for resolving MDX URLs
 * @returns Compiled MDX result with content JSX
 */
export async function compileMdxFrontmatter(
  source: string,
  relFilePath: string,
  baseUrl: string | undefined,
): Promise<CompileMDXResult> {
  return await compileMDX({
    source,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGFM],
        rehypePlugins: [rehypeLink(process.env.BASE_PATH), rehypeImg(relFilePath, baseUrl)],
      },
    },
    components: {
      a,
      img: Img,
      code,
      p,
    },
  })
}
