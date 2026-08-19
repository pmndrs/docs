import type { DocToC } from '@/app/[...slug]/DocsContext'
import { compileMdxContent } from '@/utils/compileMdxContent'
import matter from 'gray-matter'
import WebsiteOptions from '@/components/mdx/WebsiteOptions'
import type { ComponentProps, ReactNode } from 'react'
import { renderToReadableStream } from 'react-dom/server'

/**
 * The website renders a doc's title from its frontmatter, in the page layout, which is why
 * its `h1` renders nothing. A fragment has no layout, so it must keep the title it is given.
 */
export const fragmentComponents = {
  WebsiteOptions,
  h1: (props: ComponentProps<'h1'>) => (
    <h1 className="mb-2 text-5xl font-bold tracking-tighter" {...props} />
  ),

  /**
   * Mermaid draws in the browser, and a fragment carries no script. Rather than the empty
   * frame the website would leave, keep the diagram as the fenced block it was written as —
   * which GitHub, and most markdown renderers, draw on their own.
   */
  Mermaid: ({ chart }: { chart: string }) => (
    <pre className="language-mermaid">
      <code className="language-mermaid">{chart}</code>
    </pre>
  ),
}

/**
 * Renders a React element to an HTML string.
 *
 * `renderToReadableStream` is the only server renderer that awaits async components, which
 * ours are (`Contributors` and `Backers` fetch at compile time).
 */
export async function renderToHtml(element: ReactNode): Promise<string> {
  let failure: unknown
  const stream = await renderToReadableStream(element, {
    onError(error) {
      failure = error
    },
  })
  await stream.allReady
  const html = await new Response(stream).text()
  if (failure) throw failure
  return html
}

/**
 * Compiles one MDX source to an HTML fragment — the document body alone, with no layout.
 *
 * @param source - MDX source, frontmatter included
 * @param absoluteFilePath - Path the source was read from. Relative references in the MDX
 *   (`Sandpack folder=`, images) resolve against its directory, so pass a path inside the
 *   folder the caller means, even when the source came from stdin.
 * @param baseUrl - Base URL for resolving MDX URLs, as `MDX_BASEURL` does on the website
 */
export async function renderFragment(
  source: string,
  { absoluteFilePath, baseUrl }: { absoluteFilePath: string; baseUrl?: string },
): Promise<string> {
  const { content, data: frontmatter } = matter(source)
  const title: string = frontmatter.title?.trim() ?? ''

  const tableOfContents: DocToC[] = []
  const compiled = await compileMdxContent(title ? `# ${title}\n${content}` : content, {
    relFilePath: '',
    absoluteFilePath,
    baseUrl,
    title,
    url: '',
    tableOfContents,
    entries: [],
    components: fragmentComponents,
  })

  return renderToHtml(compiled.content)
}
