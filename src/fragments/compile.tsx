import type { DocToC } from '@/app/[...slug]/DocsContext'
import type { DocsConfig } from '@/config'
import { compileMdxContent } from '@/utils/compileMdxContent'
import matter from 'gray-matter'
import type { ComponentProps } from 'react'
import { Sandpack } from './Sandpack'

/**
 * Keeps titles and static alternatives for components that need browser scripts.
 */
export const fragmentComponents = {
  Sandpack,
  h1: (props: ComponentProps<'h1'>) => (
    <h1 className="mb-2 text-5xl font-bold tracking-tighter" {...props} />
  ),
  Mermaid: ({ chart }: { chart: string }) => (
    <pre className="language-mermaid">
      <code className="language-mermaid">{chart}</code>
    </pre>
  ),
}

/**
 * Compiles one MDX source for Next to render as a fragment.
 *
 * @param source - MDX source, including frontmatter.
 */
export async function compileFragment(
  source: string,
  {
    absoluteFilePath,
    baseUrl,
    config = {},
  }: {
    /** Logical source path used to resolve relative references, including stdin input. */
    absoluteFilePath: string
    /** Base URL for resolving MDX images and links. */
    baseUrl?: string
    /** Consumer components and named expression values shared with the website. */
    config?: DocsConfig
  },
) {
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
    components: { ...fragmentComponents, ...config.components },
    scope: config.scope,
  })

  return compiled.content
}
