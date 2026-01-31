import { createMcpHandler } from 'mcp-handler'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import { z } from 'zod'
import { libs } from '@/src/app/page'

/**
 * Mapping of internal library routes to their federated documentation sites.
 */
const URL_MAPPING: Record<string, string> = {
  '/react-three-fiber': 'https://r3f.docs.pmnd.rs',
  '/drei': 'https://drei.docs.pmnd.rs',
  '/zustand': 'https://zustand.docs.pmnd.rs',
  '/a11y': 'https://a11y.docs.pmnd.rs',
  '/react-postprocessing': 'https://postprocessing.docs.pmnd.rs',
  '/uikit': 'https://uikit.docs.pmnd.rs',
  '/xr': 'https://xr.docs.pmnd.rs',
}

/**
 * Gets the full documentation URL for a library.
 */
function getLibraryDocUrl(libKey: string): string | null {
  const lib = libs[libKey]
  if (!lib) return null

  // If the library has a full URL (starts with https://), use it
  if (lib.url.startsWith('https://')) {
    return lib.url
  }

  // Return mapped URL if it exists
  return URL_MAPPING[lib.url] || null
}

// Extract library names as a constant for efficiency
const LIBRARY_NAMES = Object.keys(libs).filter((key) => getLibraryDocUrl(key) !== null) as [
  string,
  ...string[],
]

const handler = createMcpHandler(
  (server) => {
    // Register list_pages tool
    server.registerTool(
      'list_pages',
      {
        title: 'List Pages',
        description: 'List all available paths for a pmndrs library.',
        inputSchema: {
          lib: z.enum(LIBRARY_NAMES).describe('The library name'),
        },
      },
      async ({ lib }) => {
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

          const paths = $('page')
            .map((_, el) => $(el).attr('path'))
            .get()

          return {
            content: [
              {
                type: 'text',
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
    name: 'pmndrs-mcp',
    version: '1.0.0',
  },
  {
    basePath: '/mcp',
    maxDuration: 60,
    verboseLogs: false,
  },
)

export { handler as GET, handler as POST }
