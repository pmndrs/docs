import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import * as cheerio from 'cheerio'
import { NextRequest } from 'next/server'
import fetch from 'node-fetch'
import { REGISTRY } from '@/lib/registry'

// Disable static optimization for SSE
export const dynamic = 'force-dynamic'

/**
 * SSE-based MCP server endpoint
 * This allows remote AI agents to connect to the MCP server via HTTP
 */
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  // Create a TransformStream for SSE
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  // SSE helper to send messages
  const sendSSE = async (event: string, data: any) => {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    await writer.write(encoder.encode(message))
  }

  // Create MCP server instance
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

  // Register tool handlers
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

        const page = $(`page[path="${path}"]`)
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

  // Handle the SSE connection
  ;(async () => {
    try {
      await sendSSE('connected', { message: 'MCP server connected' })

      // Send server info
      await sendSSE('server_info', {
        name: 'pmndrs-mcp',
        version: '1.0.0',
        capabilities: { tools: {} },
      })

      // Keep connection alive
      const keepAliveInterval = setInterval(async () => {
        try {
          await writer.write(encoder.encode(': keepalive\n\n'))
        } catch (e) {
          clearInterval(keepAliveInterval)
        }
      }, 30000)

      // Handle client disconnection
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAliveInterval)
        writer.close()
      })
    } catch (error) {
      console.error('SSE error:', error)
      writer.close()
    }
  })()

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

/**
 * POST handler for MCP requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Create MCP server instance
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

    // Register handlers (same as GET)
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
                description: 'The page path',
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

        const page = $(`page[path="${path}"]`)
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
    })

    // Process the request based on method
    if (body.method === 'tools/list') {
      const result = await server['handleRequest']({ method: 'tools/list', params: {} })
      return Response.json(result)
    } else if (body.method === 'tools/call') {
      const result = await server['handleRequest']({
        method: 'tools/call',
        params: body.params,
      })
      return Response.json(result)
    } else {
      return Response.json({ error: 'Unknown method' }, { status: 400 })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
