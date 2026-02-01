#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { type DataSource, listPages, getPageContent } from '../src/lib/mcp-tools.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Import libs configuration - same as remote MCP server
// This is a simplified version that works for local development
const libs: Record<string, { url: string }> = {
  'react-three-fiber': { url: 'https://r3f.docs.pmnd.rs' },
  'react-spring': { url: 'https://react-spring.docs.pmnd.rs' },
  drei: { url: 'https://drei.docs.pmnd.rs' },
  zustand: { url: '/zustand' },
  jotai: { url: '/jotai' },
  valtio: { url: '/valtio' },
  a11y: { url: '/a11y' },
  'react-postprocessing': { url: '/react-postprocessing' },
  uikit: { url: '/uikit' },
  xr: { url: '/xr' },
  prai: { url: 'https://pmndrs.github.io/prai' },
  viverse: { url: 'https://pmndrs.github.io/viverse' },
  leva: { url: '/leva' },
}

/**
 * Gets the local path to llms-full.txt for a library.
 * For local execution, we expect the files to be in the out/ directory.
 */
function getLocalLlmsPath(libKey: string): string | null {
  const lib = libs[libKey]
  if (!lib) return null

  // For external URLs, we can't access them locally offline
  if (lib.url.startsWith('https://')) {
    return null
  }

  // For internal routes, construct the local path
  if (lib.url.startsWith('/')) {
    // Assuming build output is in out/
    const localPath = resolve(__dirname, '..', 'out', lib.url.substring(1), 'llms-full.txt')
    return localPath
  }

  return null
}

// Get list of locally available libraries
const LIBRARY_NAMES = Object.keys(libs).filter((key) => {
  const lib = libs[key]
  return lib.url.startsWith('/') // Only internal routes work locally
})

if (LIBRARY_NAMES.length === 0) {
  console.error('No local libraries available. Make sure to build the project first.')
  process.exit(1)
}

/**
 * Local data source implementation - reads from local files
 */
const localDataSource: DataSource = {
  async fetchLlmsFullText(libKey: string): Promise<string> {
    const localPath = getLocalLlmsPath(libKey)
    if (!localPath) {
      throw new Error(
        `Library ${libKey} uses external URL. Local mode only supports internal libraries.`,
      )
    }

    try {
      return readFileSync(localPath, 'utf-8')
    } catch (error) {
      throw new Error(
        `Failed to read local llms-full.txt at ${localPath}. Make sure to build the project first with: npm run build`,
      )
    }
  },

  getAvailableLibraries(): string[] {
    return LIBRARY_NAMES
  },
}

// Create MCP server
const server = new Server(
  {
    name: 'pmndrs-docs-local',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
)

// Register list_pages tool
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_pages',
      description: 'List all available paths for a pmndrs library (local mode).',
      inputSchema: {
        type: 'object',
        properties: {
          lib: {
            type: 'string',
            enum: LIBRARY_NAMES,
            description: 'The library name',
          },
        },
        required: ['lib'],
      },
    },
    {
      name: 'get_page_content',
      description: 'Get surgical content of a specific page (local mode).',
      inputSchema: {
        type: 'object',
        properties: {
          lib: {
            type: 'string',
            enum: LIBRARY_NAMES,
            description: 'The library name',
          },
          path: {
            type: 'string',
            description: 'The page path (e.g., /docs/api/hooks/use-frame)',
          },
        },
        required: ['lib', 'path'],
      },
    },
  ],
}))

// Register tool call handler - uses shared business logic
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  if (name === 'list_pages') {
    try {
      const paths = await listPages(localDataSource, args.lib)
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
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      }
    }
  }

  if (name === 'get_page_content') {
    try {
      const content = await getPageContent(localDataSource, args.lib, args.path)
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
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      }
    }
  }

  return {
    content: [
      {
        type: 'text',
        text: `Unknown tool: ${name}`,
      },
    ],
    isError: true,
  }
})

// Start the server
const transport = new StdioServerTransport()
await server.connect(transport)

console.error('pmndrs-docs Local MCP server started (stdio mode)')
console.error(`Available libraries: ${LIBRARY_NAMES.join(', ')}`)
console.error('Note: This local server only works with built documentation. Run: npm run build')
