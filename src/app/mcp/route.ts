import { NextResponse } from 'next/server'

// Check if we're in static export mode at build time
const IS_EXPORT_MODE = process.env.OUTPUT === 'export'

// When in export mode, use force-static to allow the route to be exported
// Otherwise use force-dynamic for server-side execution
export const dynamic = IS_EXPORT_MODE ? 'force-static' : 'force-dynamic'
export const revalidate = false

// Lazy load dependencies only when needed (not in export mode)
let mcpHandler: any = null

async function getMcpHandler() {
  if (mcpHandler) return mcpHandler

  if (IS_EXPORT_MODE) {
    // Return a placeholder in export mode
    return null
  }

  // Dynamically import MCP dependencies
  const { createMcpHandler } = await import('mcp-handler')
  const cheerio = await import('cheerio')
  const fetch = (await import('node-fetch')).default
  const { z } = await import('zod')
  const { libs } = await import('@/app/page')

  /**
   * Gets the full documentation URL for a library.
   * Handles both external URLs (https://) and internal routes (/).
   */
  function getLibraryDocUrl(libKey: string): string | null {
    const lib = libs[libKey]
    if (!lib) return null

    if (lib.url.startsWith('https://')) {
      return lib.url
    }

    if (lib.url.startsWith('/')) {
      return `https://docs.pmnd.rs${lib.url}`
    }

    return null
  }

  const LIBRARY_NAMES = Object.keys(libs).filter((key) => getLibraryDocUrl(key) !== null) as [
    string,
    ...string[],
  ]

  mcpHandler = createMcpHandler(
    (server: any) => {
      server.registerTool(
        'list_pages',
        {
          title: 'List Pages',
          description: 'List all available paths for a pmndrs library.',
          inputSchema: {
            lib: z.enum(LIBRARY_NAMES).describe('The library name'),
          },
        },
        async ({ lib }: { lib: string }) => {
          const url = getLibraryDocUrl(lib)
          if (!url) throw new Error(`Unknown library: ${lib}`)

          const response = await fetch(`${url}/llms-full.txt`)
          if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)

          const fullText = await response.text()
          const $ = cheerio.load(fullText, { xmlMode: true })
          const paths = $('page')
            .map((_: any, el: any) => $(el).attr('path'))
            .get()

          return { content: [{ type: 'text', text: paths.join('\n') }] }
        },
      )

      server.registerTool(
        'get_page_content',
        {
          title: 'Get Page Content',
          description: 'Get surgical content of a specific page.',
          inputSchema: {
            lib: z.enum(LIBRARY_NAMES).describe('The library name'),
            path: z.string().describe('The page path'),
          },
        },
        async ({ lib, path }: { lib: string; path: string }) => {
          const url = getLibraryDocUrl(lib)
          if (!url) throw new Error(`Unknown library: ${lib}`)

          const response = await fetch(`${url}/llms-full.txt`)
          if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)

          const fullText = await response.text()
          const $ = cheerio.load(fullText, { xmlMode: true })
          const page = $('page').filter((_: any, el: any) => $(el).attr('path') === path)

          if (page.length === 0) throw new Error(`Page not found: ${path}`)
          return { content: [{ type: 'text', text: page.text().trim() }] }
        },
      )
    },
    {
      serverInfo: {
        name: 'pmndrs-docs',
        version: '1.0.0',
      },
    },
    {
      basePath: '/mcp',
      maxDuration: 60,
      verboseLogs: false,
    },
  )

  return mcpHandler
}

export async function GET(request: Request) {
  if (IS_EXPORT_MODE) {
    return NextResponse.json(
      {
        error: 'MCP server unavailable',
        message: 'This endpoint requires server-side execution. Deploy to Vercel or use a server environment.',
      },
      { status: 503 }
    )
  }

  const handler = await getMcpHandler()
  return handler(request)
}

export async function POST(request: Request) {
  if (IS_EXPORT_MODE) {
    return NextResponse.json(
      {
        error: 'MCP server unavailable',
        message: 'This endpoint requires server-side execution. Deploy to Vercel or use a server environment.',
      },
      { status: 503 }
    )
  }

  const handler = await getMcpHandler()
  return handler(request)
}
