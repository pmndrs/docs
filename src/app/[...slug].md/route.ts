import { crawl, MARKDOWN_REGEX } from '@/utils/docs'
import matter from 'gray-matter'
import fs from 'node:fs'
import { notFound } from 'next/navigation'

export const dynamic = 'force-static'

// Generate static params for all MDX files
export async function generateStaticParams() {
  const { MDX } = process.env
  if (!MDX) throw new Error('MDX env var not set')

  const files = await crawl(MDX, (dir) => !dir.includes('node_modules') && MARKDOWN_REGEX.test(dir))

  return files.map((file) => {
    const path = file.replace(`${MDX}/`, '')
    const slug = path.replace(MARKDOWN_REGEX, '').toLowerCase().split('/')

    return {
      slug,
    }
  })
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const { MDX } = process.env
  if (!MDX) throw new Error('MDX env var not set')

  // Construct the file path from the slug
  const filePath = `${MDX}/${slug.join('/')}.mdx`
  const altFilePath = `${MDX}/${slug.join('/')}.md`

  try {
    // Try .mdx first, then .md
    let rawContent: string
    try {
      rawContent = await fs.promises.readFile(filePath, { encoding: 'utf-8' })
    } catch {
      rawContent = await fs.promises.readFile(altFilePath, { encoding: 'utf-8' })
    }

    // Parse frontmatter
    const { data: frontmatter, content } = matter(rawContent)

    // Replace YAML frontmatter with llms.txt compatible format
    // Format: key-value pairs separated by newlines, followed by content
    const frontmatterLines: string[] = []
    
    if (frontmatter.title) {
      frontmatterLines.push(`# ${frontmatter.title}`)
    }
    if (frontmatter.description) {
      frontmatterLines.push(`> ${frontmatter.description}`)
    }
    
    // Add other metadata as comments
    const otherMetadata = Object.entries(frontmatter)
      .filter(([key]) => key !== 'title' && key !== 'description')
      .map(([key, value]) => `<!-- ${key}: ${value} -->`)
    
    frontmatterLines.push(...otherMetadata)

    const outputContent = frontmatterLines.length > 0 
      ? `${frontmatterLines.join('\n')}\n\n${content}` 
      : content

    return new Response(outputContent, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    })
  } catch (error) {
    notFound()
  }
}
