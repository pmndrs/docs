import matter from 'gray-matter'
import { resolveLocalMdx } from './utils/localMdx'

/** Resolve an authored page to Markdown, omitting its documentation frontmatter. */
export async function renderMarkdown(
  source: string,
  { absoluteFilePath }: { absoluteFilePath: string },
) {
  const { content } = matter(source)
  return (await resolveLocalMdx(content, absoluteFilePath)).markdown
}
