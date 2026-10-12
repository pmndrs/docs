export { resolveMdxBuildContext } from './cli/mdx-context'
import type { MdxBuildContext } from './mdxContext'
import matter from 'gray-matter'
import { resolveLocalMdx } from './utils/localMdx'

/** Resolve an authored page to Markdown, omitting its documentation frontmatter. */
export async function renderMarkdown(
  source: string,
  { absoluteFilePath, context }: { absoluteFilePath: string; context?: MdxBuildContext },
) {
  const { content } = matter(source)
  return (await resolveLocalMdx(content, absoluteFilePath, context)).markdown
}
