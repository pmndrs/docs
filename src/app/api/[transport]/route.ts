import { createMcpHandler } from 'mcp-handler'
import * as cheerio from 'cheerio'
import { z } from 'zod'
import { headers } from 'next/headers'
import { revalidateTag } from 'next/cache'
import { libs, type SUPPORTED_LIBRARY_NAMES } from '@/app/page'
import packageJson from '@/package.json' with { type: 'json' }
// Note: The .js extension is required for ESM imports, but TypeScript still uses mcp.d.ts for type checking
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'

// Extract entries and library names as constants for efficiency
// Only support libraries with pmndrs.github.io in their docs_url (which have <page> tags in /llms-full.txt)
// Also support libraries with local paths starting with / (served from current server)
const libsEntries = Object.entries(libs).filter(
  ([, lib]) => lib.docs_url.includes('pmndrs.github.io') || lib.docs_url.startsWith('/'),
)
const libraryList = libsEntries.map(([libname]) => `- ${libname}`).join('\n')

async function baseUrl() {
  const host = (await headers()).get('host')
  if (!host) throw new Error('Unable to determine host')

  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

const handler = createMcpHandler(
  (server) => {
    //
    // Register manifest resource
    //

    server.registerResource(
      'pmndrs-docs Manifest',
      'docs://pmndrs/manifest',
      {
        description: 'Global description and behavior rules for this MCP server.',
        mimeType: 'text/markdown',
      },
      async () => {
        return {
          contents: [
            {
              uri: 'docs://pmndrs/manifest',
              text: `# PMNDRS Documentation MCP Server

## Overview

This MCP (Model Context Protocol) server provides programmatic access to documentation for all pmndrs libraries through surgical queries. It enables AI agents to efficiently retrieve specific documentation pages without downloading entire sites.

## Supported Libraries

The server supports all pmndrs ecosystem libraries including:
${libraryList}

## Available Resources

### 1. \`docs://pmndrs/manifest\`
This manifest - provides an overview of the server, its capabilities, and usage guidelines.

### 2. \`docs://{lib}/index\`
Index of available documentation pages for each library. Each library has its own index resource:
- \`docs://zustand/index\` - Zustand documentation index
- \`docs://jotai/index\` - Jotai documentation index
- \`docs://valtio/index\` - Valtio documentation index
- And similarly for all other supported libraries

**Output format:**
Each line contains: \`{page_path} - {page_title}\`

**Example:**
\`\`\`
/docs/guides/typescript - TypeScript Guide
/docs/api/create - create API
/docs/guides/auto-generating-selectors - Auto-generating Selectors
\`\`\`

### 3. \`docs://{lib}/{path}\`
Individual documentation pages for each library. Each page is exposed as a separate resource.

**URI format:** \`docs://{lib}/{path}\` where:
- \`{lib}\` is the library name (e.g., "zustand", "jotai", "valtio")
- \`{path}\` is the page path without leading slash (e.g., "docs/guides/typescript")

**Output:**
- The full markdown content of the requested page

**Examples:**
- \`docs://zustand/docs/guides/typescript\` - TypeScript Guide for Zustand
- \`docs://jotai/docs/api/create\` - create API documentation for Jotai
- \`docs://react-three-fiber/docs/api/hooks/use-frame\` - useFrame Hook for React Three Fiber

## Best Practices

### Efficient Querying
1. **Always start with library index resources** (e.g., \`docs://zustand/index\`) to discover available documentation before requesting specific pages
2. **Use resource URIs directly** - all documentation is now available as resources
3. **Reference specific pages** by constructing URIs like \`docs://{lib}/{path}\` where path is without the leading slash

### Understanding the Content
1. Documentation is returned as **raw markdown text**
2. Code examples are included inline with syntax highlighting markers
3. Each page is self-contained and focuses on a specific topic

### Working with Libraries
1. Library names are **case-sensitive** (use exact names as listed above)
2. Internal routes (like \`/zustand\`) are automatically resolved to \`https://docs.pmnd.rs/zustand\`
3. External library documentation is fetched from their respective domains

## Error Handling

The server provides clear error messages for common issues:
- **Unknown library**: The specified library name doesn't exist
- **Page not found**: The requested path doesn't exist for that library
- **Network errors**: Connectivity issues fetching documentation

Always handle errors gracefully and consider alternative approaches when a specific page isn't available.

## Resource URI Scheme

Resources use the \`docs://\` URI scheme:
- \`docs://pmndrs/manifest\` - This manifest document
- \`docs://{lib}/index\` - Page index for each library (e.g., \`docs://zustand/index\`)
- \`docs://{lib}/{path}\` - Individual documentation pages (e.g., \`docs://zustand/docs/guides/typescript\`)

## Technical Notes

### Architecture
- Built with \`mcp-handler\` for Vercel deployment
- Uses Server-Sent Events (SSE) transport at \`/api/sse\`
- HTTP streamable transport available at \`/api/mcp\`
- Documentation is parsed from XML-tagged full-text dumps (\`/llms-full.txt\`)

### Security
- CSS selector injection protection via \`.filter()\` instead of direct selectors
- Input validation with Zod schemas
- No arbitrary URL fetching - only approved pmndrs libraries

### Performance
- 60-second timeout for tool executions
- Minimal payload - only requested pages are transferred
- XML parsing with Cheerio for efficient text extraction
- **5-minute fetch cache** for documentation content (revalidated every 5 minutes)
- Cache tags for granular invalidation per library

## Getting Started

1. Connect to the server at \`https://docs.pmnd.rs/api/sse\`
2. Read \`docs://pmndrs/manifest\` to understand server capabilities
3. Access \`docs://{lib}/index\` to discover available documentation for a library
4. Read specific pages using \`docs://{lib}/{path}\` resources (path without leading slash)
5. Combine information from multiple pages to provide comprehensive answers

## Example Workflow

\`\`\`
1. User asks: "How do I use TypeScript with Zustand?"

2. Agent thinks: I should check what Zustand documentation is available
   → Read resource docs://zustand/index
   → Discover there's a "/docs/guides/typescript - TypeScript Guide" page

3. Agent retrieves content:
   → Read resource docs://zustand/docs/guides/typescript (note: path without leading slash)
   
4. Agent synthesizes answer from the documentation content
\`\`\`

## Notes

- Documentation is cached for 5 minutes to improve performance
- Cache can be invalidated per library using Next.js cache tags
- Always retrieves fresh content after cache expiration
- Suitable for both simple queries and comprehensive research
`,
            },
          ],
        }
      },
    )

    //
    // Register dynamic resources for each library index (alternative to resource templates)
    //

    for (const [libname, lib] of libsEntries) {
      server.registerResource(
        `${libname} index`,
        `docs://${libname}/index`,
        {
          description: `List of available pages for the ${libname} library.`,
          mimeType: 'text/plain',
        },
        async () => {
          let url: string = lib.docs_url

          if (url.startsWith('/')) {
            url = `${await baseUrl()}`
          }

          // Fetch the remote file with caching
          const response = await fetch(`${url}/llms-full.txt`, {
            next: {
              revalidate: 300, // Cache for 5 minutes
              tags: [`llms-full-${libname}`],
            },
          })
          const fullText = await response.text()
          const $ = cheerio.load(fullText, { xmlMode: true })

          // Extract paths + titles to help AI choose intelligently
          const paths = $('page')
            .map((_, el) => `${$(el).attr('path')} - ${$(el).attr('title') || 'Untitled'}`)
            .get()

          return {
            contents: [
              {
                uri: `docs://${libname}/index`,
                text: paths.join('\n'),
              },
            ],
          }
        },
      )
    }

    //
    // Register resource templates for each library's pages
    //

    for (const [libname, lib] of libsEntries) {
      const template = new ResourceTemplate(`docs://${libname}/{path}`, {
        // List all resources matching this template
        list: async () => {
          let url: string = lib.docs_url

          if (url.startsWith('/')) {
            url = `${await baseUrl()}`
          }

          try {
            const response = await fetch(`${url}/llms-full.txt`, {
              next: {
                revalidate: 300, // Cache for 5 minutes
                tags: [`llms-full-${libname}`],
              },
            })
            const fullText = await response.text()
            const $ = cheerio.load(fullText, { xmlMode: true })

            // Return list of resources in the correct format
            const resources = $('page')
              .map((_, el) => {
                const pagePath = $(el).attr('path')
                if (!pagePath) return null

                // Remove leading slash from path for URI
                const uriPath = pagePath.startsWith('/') ? pagePath.slice(1) : pagePath
                const pageTitle = $(el).attr('title') || 'Untitled'

                return {
                  uri: `docs://${libname}/${uriPath}`,
                  name: pageTitle,
                  description: `${pageTitle} page for ${libname}`,
                  mimeType: 'text/markdown' as const,
                }
              })
              .get()
              .filter((item): item is NonNullable<typeof item> => item !== null)

            return { resources }
          } catch (error) {
            console.error(`Failed to list pages for ${libname}:`, error)
            return { resources: [] }
          }
        },
      })

      server.registerResource(
        `${libname} pages`,
        template,
        {
          description: `Documentation pages for ${libname}. Use the index resource (docs://${libname}/index) to discover available paths.`,
          mimeType: 'text/markdown',
        },
        async (uri, variables) => {
          const { path } = variables
          let url: string = lib.docs_url

          if (url.startsWith('/')) {
            url = `${await baseUrl()}`
          }

          try {
            // Debug logging to understand what we're receiving
            console.log('[MCP Resource Read] Raw path from variables:', path)
            console.log('[MCP Resource Read] URI:', uri.toString())

            const response = await fetch(`${url}/llms-full.txt`, {
              next: {
                revalidate: 300, // Cache for 5 minutes
                tags: [`llms-full-${libname}`],
              },
            })
            if (!response.ok) {
              throw new Error(`Failed to fetch llms-full.txt: ${response.statusText}`)
            }
            const fullText = await response.text()
            const $ = cheerio.load(fullText, { xmlMode: true })

            // Use .filter() to avoid CSS selector injection
            // Decode the path in case it's URL-encoded, then add leading slash to match XML format
            // Handle both string and string[] cases from URI template variables
            const pathString = Array.isArray(path) ? path[0] : path
            console.log('[MCP Resource Read] Path string:', pathString)
            const decodedPath = decodeURIComponent(pathString)
            console.log('[MCP Resource Read] Decoded path:', decodedPath)
            const searchPath = `/${decodedPath}`
            console.log('[MCP Resource Read] Search path:', searchPath)
            const page = $('page').filter((_, el) => $(el).attr('path') === searchPath)
            if (page.length === 0) {
              throw new Error(`Page not found: ${searchPath}`)
            }

            return {
              contents: [
                {
                  uri: uri.toString(),
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
    }
  },
  {
    serverInfo: {
      name: 'pmndrs-docs',
      version: packageJson.version,
    },
  },
  {
    basePath: '/api',
    maxDuration: 60,
    verboseLogs: false,
  },
)

export { handler as GET, handler as POST }
