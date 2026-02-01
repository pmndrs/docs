import { createMcpHandler } from 'mcp-handler'
import * as cheerio from 'cheerio'
import { z } from 'zod'
import { libs } from '@/app/page'

/**
 * Gets the full documentation URL for a library.
 * Handles both external URLs (https://) and internal routes (/).
 */
function getLibraryDocUrl(libKey: string): string | null {
  const lib = libs[libKey]
  if (!lib) return null

  // If the library has a full external URL, use it directly
  if (lib.url.startsWith('https://')) {
    return lib.url
  }

  // For internal routes, construct the full URL with docs.pmnd.rs base
  if (lib.url.startsWith('/')) {
    return `https://docs.pmnd.rs${lib.url}`
  }

  return null
}

// Extract library names as a constant for efficiency
const LIBRARY_NAMES = Object.keys(libs).filter((key) => getLibraryDocUrl(key) !== null) as [
  string,
  ...string[],
]

const handler = createMcpHandler(
  (server) => {
    // Register manifest resource
    server.registerResource(
      'PMNDRS Skill Manifest',
      'docs://pmndrs/manifest',
      {
        description: 'Global description and behavior rules for this MCP server.',
        mimeType: 'text/markdown',
      },
      async () => {
        // Fetch the skill.md file hosted on docs.pmnd.rs
        const content = await fetch('https://docs.pmnd.rs/skill.md').then((r) => r.text())
        return {
          contents: [
            {
              uri: 'docs://pmndrs/manifest',
              text: content,
            },
          ],
        }
      },
    )

    // Register library page index resource template
    server.registerResourceTemplate(
      'docs://{lib}/index',
      {
        name: 'Library Page Index',
        description: 'Lists all available paths for a specific library.',
        mimeType: 'text/plain',
      },
      async ({ lib }: { lib: string }) => {
        const url = getLibraryDocUrl(lib)
        if (!url) {
          throw new Error(`Library ${lib} not found`)
        }

        try {
          const response = await fetch(`${url}/llms-full.txt`)
          if (!response.ok) {
            throw new Error(`Failed to fetch llms-full.txt: ${response.statusText}`)
          }
          const fullText = await response.text()
          const $ = cheerio.load(fullText, { xmlMode: true })

          // Extract only the paths to avoid saturating the context
          const paths = $('page')
            .map((_, el) => $(el).attr('path'))
            .get()

          return {
            contents: [
              {
                uri: `docs://${lib}/index`,
                mimeType: 'text/plain',
                text: paths.join('\n'),
              },
            ],
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          throw new Error(`MCP server error: ${errorMessage}`)
        }
      },
    )

    // Register get_page_content tool
    server.registerTool(
      'get_page_content',
      {
        title: 'Get Page Content',
        description: 'Get surgical content of a specific page.',
        inputSchema: {
          lib: z.enum(LIBRARY_NAMES).describe('The library name'),
          path: z.string().describe('The page path (e.g., /docs/api/hooks/use-frame)'),
        },
      },
      async ({ lib, path }) => {
        const url = getLibraryDocUrl(lib)
        if (!url) {
          throw new Error(`Unknown library: ${lib}`)
        }

        try {
          const response = await fetch(`${url}/llms-full.txt`)
          if (!response.ok) {
            throw new Error(`Failed to fetch llms-full.txt: ${response.statusText}`)
          }
          const fullText = await response.text()
          const $ = cheerio.load(fullText, { xmlMode: true })

          // Use .filter() to avoid CSS selector injection
          const page = $('page').filter((_, el) => $(el).attr('path') === path)
          if (page.length === 0) {
            throw new Error(`Page not found: ${path}`)
          }

          return {
            content: [
              {
                type: 'text',
                text: page.text().trim(),
              },
            ],
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          throw new Error(`MCP server error: ${errorMessage}`)
        }
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
    basePath: '/api',
    maxDuration: 60,
    verboseLogs: false,
  },
)

export { handler as GET, handler as POST }
