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
import { Badge } from '@/components/mdx/Badge'
import { Code } from '@/components/mdx/Code'
import { rehypeCode } from '@/components/mdx/Code/rehypeCode'
import { rehypePackageManagers } from '@/components/mdx/Code/rehypePackageManagers'
import { Codesandbox } from '@/components/mdx/Codesandbox'
import { rehypeCodesandbox } from '@/components/mdx/Codesandbox/rehypeCodesandbox'
import { Color, ColorGroup } from '@/components/mdx/Color'
import { Details } from '@/components/mdx/Details'
import { rehypeDetails } from '@/components/mdx/Details/rehypeDetails'
import { Entries, type Entry } from '@/components/mdx/Entries'
import { Gha } from '@/components/mdx/Gha'
import { rehypeGha } from '@/components/mdx/Gha/rehypeGha'
import { Grid } from '@/components/mdx/Grid'
import { Hint } from '@/components/mdx/Hint'
import { Img } from '@/components/mdx/Img'
import { rehypeImg } from '@/components/mdx/Img/rehypeImg'
import { Intro } from '@/components/mdx/Intro'
import { rehypeLink } from '@/components/mdx/Link/rehypeLink'
import { Keypoints, KeypointsItem } from '@/components/mdx/Keypoints'
import { McpLiveEmbed } from '@/components/mdx/McpLiveEmbed'
import { Mermaid } from '@/components/mdx/Mermaid'
import { rehypeMermaid } from '@/components/mdx/Mermaid/rehypeMermaid'
import { Backers, Contributors } from '@/components/mdx/People'
import { Sandpack } from '@/components/mdx/Sandpack'
import { rehypeSandpack } from '@/components/mdx/Sandpack/rehypeSandpack'
import { Step, Steps } from '@/components/mdx/Steps'
import { Summary } from '@/components/mdx/Summary'
import { rehypeSummary } from '@/components/mdx/Summary/rehypeSummary'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/mdx/Tabs'
import { rehypeToc } from '@/components/mdx/Toc/rehypeToc'
import { rehypeInlineFlow } from '@/utils/rehypeInlineFlow'
import type { DocToC } from '@/app/[...slug]/DocsContext'
import { compileMDX } from 'next-mdx-remote/rsc'
import type { ComponentType } from 'react'
import { dirname } from 'node:path'
import rehypePrismPlus from 'rehype-prism-plus'
import remarkGFM from 'remark-gfm'

/**
 * MDX options and components shared across the application.
 * This ensures consistent MDX rendering everywhere.
 */

export type CompileMdxContentOptions = {
  /** Relative file path, e.g. "/getting-started/tutorials/store.mdx" */
  relFilePath: string
  /** Absolute file path, against which `Sandpack folder=` is resolved */
  absoluteFilePath: string
  /** Base URL for resolving MDX URLs */
  baseUrl?: string
  /** Document title, for the ToC */
  title: string
  /** Document URL, for the ToC */
  url: string
  /** Populated with the ToC entries found while compiling */
  tableOfContents: DocToC[]
  /** All doc entries, for the `Entries` component */
  entries: Entry[]
  /** Components overriding the defaults, e.g. a visible `h1` outside the website */
  components?: Record<string, ComponentType<any>>
}

/**
 * Compiles MDX content with full options (2nd pass).
 *
 * @returns Compiled MDX result with content JSX
 */
export async function compileMdxContent(source: string, options: CompileMdxContentOptions) {
  const {
    relFilePath,
    absoluteFilePath,
    baseUrl,
    title,
    url,
    tableOfContents,
    entries,
    components,
  } = options

  return await compileMDX({
    source,
    options: {
      // Trusted docs from the consuming repo: keep `{...}` expressions next-mdx-remote 6 strips by default (blockDangerousJS stays on)
      blockJS: false,
      mdxOptions: {
        remarkPlugins: [remarkGFM],
        rehypePlugins: [
          rehypeLink(process.env.BASE_PATH),
          rehypeInlineFlow(['Badge', 'Color'], { except: ['ColorGroup'] }),
          rehypeImg(relFilePath, baseUrl),
          rehypeCodesandbox(relFilePath, baseUrl),
          rehypeDetails,
          rehypeSummary,
          rehypeGha,
          rehypeMermaid(),
          rehypePackageManagers(),
          rehypePrismPlus,
          rehypeCode(),
          rehypeToc(tableOfContents, url, title),
          rehypeSandpack(dirname(absoluteFilePath)),
        ],
      },
    },
    components: {
      ...{
        Badge,
        Code,
        Color,
        ColorGroup,
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
        McpLiveEmbed,
        Mermaid,
        Sandpack,
        Step,
        Steps,
        Summary,
        Tabs,
        TabsList,
        TabsTrigger,
        TabsContent,
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
      ...components,
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
export async function compileMdxFrontmatter(source: string) {
  return await compileMDX({
    source: `<>${source}</>`, // hack: wrap in fragment to avoid <p> wrapping
    options: {
      // Trusted docs from the consuming repo: keep `{...}` expressions next-mdx-remote 6 strips by default (blockDangerousJS stays on)
      blockJS: false,
      mdxOptions: {
        remarkPlugins: [remarkGFM],
        rehypePlugins: [rehypeLink(process.env.BASE_PATH)],
      },
    },
    components: {
      a,
      code,
    },
  })
}
