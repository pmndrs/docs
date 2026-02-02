import { createMcpHandler } from 'mcp-handler'
import * as cheerio from 'cheerio'
import { z } from 'zod'
import type { Entries } from 'type-fest'
import { libs, SUPPORTED_LIBRARY_NAMES } from '@/app/page'

// Extract entries and library names as constants for efficiency
// Only support libraries with pmndrs.github.io in their docs_url (which have <page> tags in /llms-full.txt)
// Also support libraries with local paths starting with / (served from current server)
const libsEntries = (Object.entries(libs) as Entries<typeof libs>).filter(
  ([, lib]) => lib.docs_url.includes('pmndrs.github.io') || lib.docs_url.startsWith('/'),
)

function toAbsoluteUrl(url: string) {
  // Use Vercel URL in production, fallback to NEXT_PUBLIC_URL otherwise
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_URL ?? '')
  return `${baseUrl}${url}`
}

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

    // Register dynamic resources for each library index (alternative to resource templates)
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
            url = toAbsoluteUrl(url)
          }

          // Fetch the remote file
          const response = await fetch(`${url}/llms-full.txt`)
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

    // Register get_page_content tool
    const LIBNAMES = libsEntries.map(([libname]) => libname)
    server.registerTool(
      'get_page_content',
      {
        title: 'Get Page Content',
        description: 'Get surgical content of a specific page.',
        inputSchema: {
          lib: z
            .enum(LIBNAMES as [SUPPORTED_LIBRARY_NAMES, ...SUPPORTED_LIBRARY_NAMES[]])
            .describe('The library name'),
          path: z.string().describe('The page path (e.g., /docs/api/hooks/use-frame)'),
        },
      },
      async ({ lib, path }) => {
        let url: string = libs[lib].docs_url

        if (url.startsWith('/')) {
          url = toAbsoluteUrl(url)
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
