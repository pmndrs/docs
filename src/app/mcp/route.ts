import { createMcpHandler } from 'mcp-handler'
import fetch from 'node-fetch'
import { z } from 'zod'
import { libs } from '@/app/page'
import { type DataSource, listPages, getPageContent } from '@/lib/mcp-tools'

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

/**
 * Remote data source implementation - fetches from URLs
 */
const remoteDataSource: DataSource = {
  async fetchLlmsFullText(libKey: string): Promise<string> {
    const url = getLibraryDocUrl(libKey)
    if (!url) {
      throw new Error(`Unknown library: ${libKey}`)
    }

    const response = await fetch(`${url}/llms-full.txt`)
    if (!response.ok) {
      throw new Error(`Failed to fetch llms-full.txt: ${response.statusText}`)
    }
    return await response.text()
  },

  getAvailableLibraries(): string[] {
    return LIBRARY_NAMES
  },
}

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
        try {
          const paths = await listPages(remoteDataSource, lib)
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
        try {
          const content = await getPageContent(remoteDataSource, lib, path)
          return {
            content: [
              {
                type: 'text',
                text: content,
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
    basePath: '/mcp',
    maxDuration: 60,
    verboseLogs: false,
  },
)

export { handler as GET, handler as POST }
