#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read registry from the TypeScript source
const registryPath = join(__dirname, '../src/lib/registry.ts')
const registrySource = readFileSync(registryPath, 'utf-8')

// Extract the REGISTRY object from the TypeScript source
// This is a simple parser for the specific format of registry.ts
const registryMatch = registrySource.match(/export const REGISTRY[^=]*=\s*({[\s\S]*?})\s*$/m)
if (!registryMatch) {
  throw new Error('Could not parse REGISTRY from registry.ts')
}

// Parse the registry by converting to JSON-compatible format
// Replace single quotes with double quotes and remove trailing commas
let registryJson = registryMatch[1].replace(/'/g, '"').replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')

// Use a more robust approach: evaluate the object literal
const REGISTRY = {
  'react-three-fiber': {
    url: 'https://r3f.docs.pmnd.rs',
    title: 'React Three Fiber',
    description: 'React-three-fiber is a React renderer for three.js',
  },
  zustand: {
    url: 'https://zustand.docs.pmnd.rs',
    title: 'Zustand',
    description: 'A small, fast and scalable state-management solution',
  },
  drei: {
    url: 'https://drei.docs.pmnd.rs',
    title: 'Drei',
    description: 'Useful helpers and abstractions for react-three-fiber',
  },
  viverse: {
    url: 'https://pmndrs.github.io/viverse',
    title: 'viverse',
    description: 'Toolkit for building Three.js and React Three Fiber Apps for VIVERSE',
  },
}

const server = new Server(
  {
    name: 'pmndrs-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_pages',
      description: 'List all available paths for a pmndrs library.',
      inputSchema: {
        type: 'object',
        properties: {
          lib: {
            type: 'string',
            enum: Object.keys(REGISTRY),
            description: 'The library name',
          },
        },
        required: ['lib'],
      },
    },
    {
      name: 'get_page_content',
      description: 'Get surgical content of a specific page.',
      inputSchema: {
        type: 'object',
        properties: {
          lib: {
            type: 'string',
            enum: Object.keys(REGISTRY),
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

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  if (!args || typeof args !== 'object') {
    throw new Error('Invalid arguments')
  }

  const lib = args.lib
  if (typeof lib !== 'string') {
    throw new Error('Library name must be a string')
  }

  const config = REGISTRY[lib]
  if (!config) {
    throw new Error(`Unknown library: ${lib}`)
  }

  try {
    const response = await fetch(`${config.url}/llms-full.txt`)
    if (!response.ok) {
      throw new Error(`Failed to fetch llms-full.txt: ${response.statusText}`)
    }
    const fullText = await response.text()
    const $ = cheerio.load(fullText, { xmlMode: true })

    if (name === 'list_pages') {
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
    }

    if (name === 'get_page_content') {
      const path = args.path
      if (typeof path !== 'string') {
        throw new Error('Path must be a string')
      }

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
    }

    throw new Error(`Unknown tool: ${name}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`MCP server error: ${errorMessage}`)
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
