import { crawl, MARKDOWN_REGEX } from '@/utils/docs'
import matter from 'gray-matter'
import fs from 'node:fs'

export const dynamic = 'force-static'

export async function GET() {
  const { MDX } = process.env
  if (!MDX) throw new Error('MDX env var not set')

  // Get all markdown files
  const files = await crawl(MDX, (dir) => !dir.includes('node_modules') && MARKDOWN_REGEX.test(dir))

  // Parse files to get metadata
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

      return {
        url,
        title,
        description,
        nav,
      }
    }),
  )

  // Sort by nav order
  docs.sort((a, b) => a.nav - b.nav)

  // Generate llms.txt content
  const content = `# pmndrs/docs

Documentation generator for pmndrs/* projects.

This is a static MDX documentation generator with a GitHub reusable workflow, primarily used for pmndrs/* projects.

## Documentation

${docs.map((doc) => `- ${doc.title}: ${doc.url} (source: ${doc.url}.md)${doc.description ? ` - ${doc.description}` : ''}`).join('\n')}

---

For full documentation content, see /llms-full.txt
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
