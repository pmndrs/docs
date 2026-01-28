import { crawl, MARKDOWN_REGEX } from '@/utils/docs'
import matter from 'gray-matter'
import fs from 'node:fs'

export const dynamic = 'force-static'

/**
 * Remove JSX/MDX components and clean up markdown for plain text output
 */
function cleanMarkdown(content: string): string {
  let result = content

  // Remove self-closing JSX tags like <Component />
  result = result.replace(/<[A-Z][a-zA-Z0-9]*[^>]*\/>/g, '')

  // Remove JSX component blocks (opening and closing tags with content)
  // Keep applying until no more matches (handles nested components)
  let prevResult
  let maxIterations = 20 // Safety limit
  let iterations = 0

  do {
    prevResult = result
    // Match opening tag, content, and corresponding closing tag
    result = result.replace(/<[A-Z][a-zA-Z0-9]*(?:\s[^>]*)?>[\s\S]*?<\/[A-Z][a-zA-Z0-9]*>/g, '')
    iterations++
  } while (result !== prevResult && iterations < maxIterations)

  // Clean up any remaining orphaned tags (shouldn't happen but just in case)
  result = result.replace(/<\/?[A-Z][a-zA-Z0-9]*(?:\s[^>]*)?>/g, '')

  // Remove inline link syntax <https://...>
  result = result.replace(/<(http[^>]+)>/g, '$1')

  // Clean up multiple empty lines
  result = result.replace(/\n{3,}/g, '\n\n')

  return result.trim()
}

export async function GET() {
  const { MDX } = process.env
  if (!MDX) throw new Error('MDX env var not set')

  // Get all markdown files
  const files = await crawl(MDX, (dir) => !dir.includes('node_modules') && MARKDOWN_REGEX.test(dir))

  // Parse files to get metadata and content
  const docs = await Promise.all(
    files.map(async (file) => {
      const path = file.replace(`${MDX}/`, '')
      const slug = [...path.replace(MARKDOWN_REGEX, '').toLowerCase().split('/')]
      const url = `/${slug.join('/')}`

      const str = await fs.promises.readFile(file, { encoding: 'utf-8' })
      const compiled = matter(str)
      const frontmatter = compiled.data

      const title: string = frontmatter.title?.trim() ?? slug[slug.length - 1].replace(/\-/g, ' ')
      const description: string = frontmatter.description ?? ''
      const nav: number = frontmatter.nav ?? Infinity
      const content = cleanMarkdown(compiled.content)

      return {
        url,
        title,
        description,
        nav,
        content,
      }
    }),
  )

  // Sort by nav order
  docs.sort((a, b) => a.nav - b.nav)

  // Generate llms-full.txt content
  const header = `# pmndrs/docs - Full Documentation

Documentation generator for pmndrs/* projects.

This is a static MDX documentation generator with a GitHub reusable workflow, primarily used for pmndrs/* projects.

================================================================================

`

  const fullContent =
    header +
    docs
      .map((doc) => {
        return `# ${doc.title}

URL: ${doc.url}
${doc.description ? `Description: ${doc.description}\n` : ''}
${doc.content}

================================================================================
`
      })
      .join('\n')

  return new Response(fullContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
