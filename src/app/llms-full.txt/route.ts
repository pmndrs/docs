import { parseDocsMetadata } from '@/utils/docs'
import { fragment } from 'xmlbuilder2'

export const dynamic = 'force-static'

/**
 * Basic cleanup of markdown content
 */
function cleanMarkdown(content: string): string {
  // Just do basic cleanup - keep JSX tags as-is
  return content
    .replace(/\n{3,}/g, '\n\n') // Clean up multiple empty lines
    .trim()
}

export async function GET() {
  const { MDX, NEXT_PUBLIC_LIBNAME, NEXT_PUBLIC_URL } = process.env
  if (!MDX) throw new Error('MDX env var not set')
  if (!NEXT_PUBLIC_LIBNAME) throw new Error('NEXT_PUBLIC_LIBNAME env var not set')

  const docs = await parseDocsMetadata(MDX)

  const baseUrl = NEXT_PUBLIC_URL || ''

  // Generate llms-full.txt content with proper XML
  const header = `${NEXT_PUBLIC_LIBNAME}

Full documentation content.

`

  // Build XML for each page using fragment mode for efficiency
  const pages = docs.map((doc) => {
    const url = baseUrl ? `${baseUrl}${doc.url}` : doc.url
    const pageContent = `URL: ${url}
${doc.description ? `Description: ${doc.description}\n` : ''}
${cleanMarkdown(doc.content)}`

    // Create XML fragment for efficient generation
    const page = fragment()
      .ele('page', {
        path: doc.url,
        title: doc.title,
      })
      .txt(pageContent)
      .up()

    // Return the XML string
    return page.end({ headless: true })
  })

  const fullContent = header + pages.join('\n') + '\n'

  return new Response(fullContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
