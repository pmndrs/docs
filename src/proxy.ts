import { parseDocsMetadata } from '@/utils/docs'
import matter from 'gray-matter'
import { NextRequest, NextResponse } from 'next/server'

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the URL ends with .md
  if (!pathname.endsWith('.md')) {
    return NextResponse.next()
  }

  // Remove the .md suffix and leading slash to get the slug
  const slugPath = pathname.slice(1, -3) // Remove leading '/' and trailing '.md'
  const url = `/${slugPath}`

  // Get MDX root directory
  const MDX = process.env.MDX
  if (!MDX) {
    return new NextResponse(
      'MDX environment variable is not configured. Please set MDX to the path of your documentation root directory.',
      { status: 500 },
    )
  }

  try {
    // Parse all docs to find the matching one
    const docs = await parseDocsMetadata(MDX)
    const doc = docs.find((d) => d.url.toLowerCase() === url.toLowerCase())

    if (!doc) {
      return new NextResponse(`Doc not found: ${url}`, { status: 404 })
    }

    // Reconstruct the full MDX source with frontmatter
    const frontmatterString = matter.stringify(doc.content, doc.frontmatter)

    // Return raw MDX source as plain text
    return new NextResponse(frontmatterString, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error processing MDX source:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export const config = {
  matcher: '/:path*.md',
}
