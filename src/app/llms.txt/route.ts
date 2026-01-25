import { getDocs } from '@/utils/docs'
import { NextResponse } from 'next/server'

export const dynamic = 'force-static'
export const revalidate = false

export async function GET() {
  const { MDX } = process.env
  if (!MDX) {
    return new NextResponse('MDX env var not set', { status: 500 })
  }

  try {
    // Get all docs
    const docs = await getDocs(MDX, null, false)

    // Generate llms.txt content
    const libname = process.env.NEXT_PUBLIC_LIBNAME || 'Documentation'
    let content = `# ${libname}\n\n`

    // Add each document
    for (const doc of docs) {
      content += `## ${doc.title}\n\n`

      if (doc.description) {
        content += `${doc.description}\n\n`
      }

      content += `URL: ${doc.url}\n\n`

      if (doc.tableOfContents && doc.tableOfContents.length > 0) {
        content += `### Table of Contents\n\n`
        for (const item of doc.tableOfContents) {
          content += `- ${item.title}\n`
        }
        content += '\n'
      }

      content += '---\n\n'
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error generating llms.txt:', error)
    return new NextResponse('Error generating llms.txt', { status: 500 })
  }
}
