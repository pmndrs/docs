import { crawl, MARKDOWN_REGEX } from '@/utils/docs'
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
    let content: string
    try {
      content = await fs.promises.readFile(filePath, { encoding: 'utf-8' })
    } catch {
      content = await fs.promises.readFile(altFilePath, { encoding: 'utf-8' })
    }

    // Return the raw MDX source file as-is
    return new Response(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    })
  } catch (error) {
    notFound()
  }
}
