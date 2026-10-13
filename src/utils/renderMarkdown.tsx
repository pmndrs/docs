import type { Root } from 'hast'
import { visit } from 'unist-util-visit'
import { rehypeInlineFlow } from './rehypeInlineFlow'
import type { DocsConfig } from '@/config'
import { rehypeImg } from '@/components/mdx/Img/rehypeImg'
import { rehypeLink } from '@/components/mdx/Link/rehypeLink'
import { compileMDX } from 'next-mdx-remote/rsc'
import { relative } from 'node:path'
import type { ReactNode } from 'react'
// Next route handlers require the stream renderer's explicit edge entry point.
import { renderToReadableStream } from 'react-dom/server.edge'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'
import type { parseDocsMetadata } from './docs'
import { markdownComponents } from './markdownComponents'
import { markdownHandlers, rehypePreserveCodeMeta, remarkAutolinks } from './markdownSyntax'

type ParsedDoc = Awaited<ReturnType<typeof parseDocsMetadata>>[number]

/**
 * Compiles trusted MDX into document-only Markdown. Code nodes stay literal; expressions
 * and JSX are evaluated with the same scope as the website before semantic serialization.
 * @param source - MDX without frontmatter
 * @param options - Consumer extensions and document context
 */
export async function renderMarkdown(
  source: string,
  {
    config = {},
    entries = [],
    relFilePath = '',
    baseUrl,
  }: {
    /** Consumer components, static alternatives and expression values. */
    config?: DocsConfig
    /** Pages available to the Entries component. */
    entries?: Pick<ParsedDoc, 'url' | 'title' | 'slug'>[]
    /** Current document path relative to the MDX directory. */
    relFilePath?: string
    /** Base URL for document assets. */
    baseUrl?: string
  } = {},
) {
  const components = { ...markdownComponents({ entries, relFilePath, baseUrl }) }
  const customComponents = Object.fromEntries(
    Object.entries(config.components ?? {}).map(([name, component]) => {
      // Next keeps client components as opaque references in route handlers. Never try to
      // execute one here or pretend its current browser state is available at build time.
      const isClientReference =
        '$$typeof' in component && component.$$typeof === Symbol.for('react.client.reference')
      return [
        name,
        isClientReference
          ? ({ children }: { children?: ReactNode }) => (
              <div>
                <p>{name}: interactive content is available on the website.</p>
                {children}
              </div>
            )
          : component,
      ]
    }),
  )
  const compiled = await compileMDX({
    source,
    options: {
      blockJS: false,
      scope: config.scope,
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkAutolinks],
        rehypePlugins: [
          rehypePreserveCodeMeta,
          rehypeLink(process.env.BASE_PATH),
          rehypeImg(relFilePath, baseUrl),
          rehypeInlineFlow(['Badge', 'Color'], { except: ['ColorGroup'] }),
        ],
      },
    },
    components: { ...components, ...customComponents, ...config.markdownComponents },
  })

  let failure: unknown
  const stream = await renderToReadableStream(compiled.content, {
    onError(error) {
      failure = error
    },
  })
  await stream.allReady
  const html = await new Response(stream).text()
  if (failure) throw failure

  const markdown = await unified()
    .use(rehypeParse, { fragment: true })
    .use(() => (tree: Root) => {
      // React text separators must not interrupt words or hide a leading task checkbox.
      visit(tree, 'comment', (_node, index, parent) => {
        if (parent && index !== undefined) {
          parent.children.splice(index, 1)
          return index
        }
      })
    })
    .use(rehypeRemark, { handlers: markdownHandlers })
    .use(remarkGfm)
    .use(remarkStringify, { fences: true, bullet: '-', emphasis: '_', rule: '-' })
    .process(html)
  return String(markdown)
}

/**
 * Exports a complete page, shared by the clipboard endpoint and llms-full.txt.
 * @param doc - Parsed source document
 * @param docs - Site entries for directory components
 * @param root - MDX directory
 * @param config - Consumer configuration
 */
export async function renderDocMarkdown(
  doc: ParsedDoc,
  docs: ParsedDoc[],
  root: string,
  config: DocsConfig,
) {
  try {
    return await renderMarkdown(
      `# ${doc.title}\n\n${doc.description ? `${doc.description}\n\n` : ''}${doc.content}`,
      {
        config,
        entries: docs,
        relFilePath: `/${relative(root, doc.file).split('\\').join('/')}`,
        baseUrl: process.env.MDX_BASEURL,
      },
    )
  } catch (error) {
    throw new Error(`Cannot export Markdown for ${doc.file}`, { cause: error })
  }
}
