import { createMcpHandler } from 'mcp-handler'
import * as cheerio from 'cheerio'
import { z } from 'zod'
import { headers } from 'next/headers'
import { revalidateTag } from 'next/cache'
import { libs, type SUPPORTED_LIBRARY_NAMES } from '@/libs'
import packageJson from '@/package.json' with { type: 'json' }
import { assertExampleName, exampleUrl, indexUrl } from '@/utils/examples'

// Extract entries and library names as constants for efficiency
// Only support libraries whose site actually publishes a /llms-full.txt dump -- see
// the `llms_full` flag in `src/libs.ts`. Being hosted on pmndrs.github.io is not
// enough: most of those sites are not built with this generator and 404 on that file,
// which used to leave their index resource silently empty.
const libsEntries = Object.entries(libs).filter(([, lib]) => 'llms_full' in lib && lib.llms_full)
const libraryList = libsEntries.map(([libname]) => `- ${libname}`).join('\n')

async function baseUrl() {
  const host = (await headers()).get('host')
  if (!host) throw new Error('Unable to determine host')

  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

/**
 * One document as pmndrs/examples published it. Cached and tagged like the docs
 * dumps, except the gallery is already split per example and already rendered,
 * so a request pulls the few kB that was asked for and passes it straight on.
 */
async function fetchDocument(url: string): Promise<string> {
  const response = await fetch(url, {
    next: { revalidate: 300, tags: ['examples-catalog'] },
  })
  // Same reason the library indexes fail loudly: a swallowed 404 reads to a
  // client as "no such example", and it will go on to invent one.
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  }
  return response.text()
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

It serves two bodies of material, and they answer different questions. The **docs** say what an API is -- signatures, props, options; the **examples** show a working scene that already does the thing, in full, with the versions it was written against. Reach for an example when the question is "how is this put together", for the docs when it is "what does this take".

## Supported Libraries

The server supports the pmndrs libraries whose documentation site publishes a
full-text dump. That is these, and only these -- any other pmndrs library is out of
scope here, however well known:
${libraryList}

## Available Resources

### 1. \`docs://pmndrs/manifest\`
This manifest - provides an overview of the server, its capabilities, and usage guidelines.

### 2. \`docs://{lib}/index\`
Index of available documentation pages for each library -- one resource per supported library, e.g. \`docs://zustand/index\` or \`docs://drei/index\`.

**Output format:**
Each line contains: \`{page_path} - {page_title}\`

**Example** (from \`docs://zustand/index\`):
\`\`\`
/learn/getting-started/introduction - Introduction
/learn/guides/beginner-typescript - Beginner TypeScript Guide
/reference/apis/create - create
\`\`\`

Path shapes differ per library -- zustand nests under \`/learn\` and \`/reference\`, react-three-fiber under \`/api\` and \`/tutorials\`, drei under \`/abstractions\` and \`/staging\`. Read the index, never extrapolate a path from another library.

### 3. \`examples://index\`
The whole pmndrs example gallery (https://pmndrs.github.io/examples), one line per demo. About 4k tokens for all of them, so read it once and pick from it -- there is no per-library or per-tag variant.

**Output format:**
\`\`\`
{name} [({title}, when it is not just the name)] · {description} · +{libraries} · #{tags} · ~{size}
\`\`\`

Every part after the name is dropped when the example does not carry it:
\`\`\`
aquarium · #transmission
arkanoid · Simple arkanoid implementation using cannon physics. · +cannon,zustand · #physics,game,audio
bounds-and-makedefault (Bounds and makeDefault) · #bounds
flow-shield · Interactive energy shield. · +postprocessing,leva · #shader · ~23k
\`\`\`

\`+\` lists only what an example uses *on top of* \`@react-three/fiber\` and \`@react-three/drei\`, which all of them use. Tags are freeform and unvalidated -- expect typos (\`gtlf\`) and both spellings of an idea (\`contact shadows\` / \`contact-shadows\`) -- so match on names and descriptions too, never on tags alone.

The trailing \`~23k\` is what \`get_example\` will cost in tokens, and only eight lines carry one. Its absence means the example is small: the median is ~1.4k tokens, so reading two or three of them costs less than this index did. Read the marked ones deliberately, one at a time.

## Available Tools

### 1. \`get_page_content\`
Retrieves the full content of a specific documentation page.

**Input:**
- \`lib\` (string): The library name
- \`path\` (string): A page path taken verbatim from that library's index (e.g., "/learn/guides/beginner-typescript")

**Output:**
- The full markdown content of the requested page

**Example usage:**
\`\`\`
Use get_page_content with lib="zustand" and path="/learn/guides/beginner-typescript" to get the beginner TypeScript guide
\`\`\`

Paths are matched exactly -- no trailing-slash or extension normalization. A path that is not in the index returns \`Page not found\`; re-read the index rather than retrying variants.

### 2. \`get_example\`
Retrieves one example in full: description, demo URL, authors, asset attribution, the exact dependency versions it is written against, and every source file it has.

**Input:**
- \`name\` (string): An example name taken verbatim from \`examples://index\` (e.g., "caustics")

**Output:**
- Markdown: a fact block, then one fenced section per source file

**Example usage:**
\`\`\`
Use get_example with name="caustics" to read the caustics demo end to end
\`\`\`

Typically 300-2k tokens, up to ~23k for the largest multi-file example. Two kinds of file are named rather than inlined: binary companions (.glb models, textures, audio), and text that is generated or vendored past the point of being readable (bundles, font atlases). Both are in the repository the response links to.

## Best Practices

### Efficient Querying
1. **Always start with library index resources** (e.g., \`docs://zustand/index\`) to discover available documentation before requesting specific pages
2. **Use resource URIs** to access page indexes - they're more efficient than tool calls for listing content
3. **Use specific page paths** rather than trying to guess URLs
4. **Let the index line say how many examples to open.** Unmarked ones are ~1.4k tokens, so reading the two that both look right beats fetching one and coming back; a \`~23k\` marker is the one case where it pays to narrow first

### Understanding the Content
1. Documentation is returned as **raw markdown text**
2. Code examples are included inline with syntax highlighting markers
3. Each page is self-contained and focuses on a specific topic

### Working with Libraries
1. Library names are **case-sensitive** (use exact names as listed above)
2. A library configured with a local \`docs_url\` is served from this host
3. External library documentation is fetched from their respective domains

## Error Handling

The server provides clear error messages for common issues:
- **Unknown library**: The specified library name doesn't exist
- **Page not found**: The requested path doesn't exist for that library
- **Not an example name**: \`get_example\` was given something that is not a published example; re-read \`examples://index\`
- **Network errors**: Connectivity issues fetching documentation

Always handle errors gracefully and consider alternative approaches when a specific page isn't available.

## Resource URI Scheme

- \`docs://pmndrs/manifest\` - This manifest document
- \`docs://{lib}/index\` - Page index for each library (e.g., \`docs://zustand/index\`)
- \`examples://index\` - The example gallery, all of it

## Technical Notes

### Architecture
- Built with \`mcp-handler\` for Vercel deployment
- HTTP streamable transport at \`/api/mcp\` -- the only transport served. The legacy
  SSE transport would need a Redis instance to relay messages, which this deployment
  does not have, so \`/api/sse\` is not usable.
- Documentation is parsed from XML-tagged full-text dumps (\`/llms-full.txt\`)
- Examples are passed through from what the gallery publishes: \`/llms.txt\` for the
  index, and each example's page URL with \`.md\` on the end for the document. They
  are public -- every example page links its own with \`rel="alternate"\` -- so the
  same text is reachable without this server

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

1. Connect to the server at \`https://docs.pmnd.rs/api/mcp\`
2. Read \`docs://pmndrs/manifest\` to understand server capabilities
3. Access \`docs://{lib}/index\` to discover available documentation for a library
4. Request specific pages with \`get_page_content\` tool
5. Combine information from multiple pages to provide comprehensive answers

## Example Workflow

\`\`\`
1. User asks: "How do I use TypeScript with Zustand?"

2. Agent thinks: I should check what Zustand documentation is available
   → Read resource docs://zustand/index
   → Discover there's a "/learn/guides/beginner-typescript - Beginner TypeScript Guide" page

3. Agent retrieves content:
   → Call tool get_page_content(lib="zustand", path="/learn/guides/beginner-typescript")

4. Agent synthesizes answer from the documentation content
\`\`\`

\`\`\`
1. User asks: "How do I make glass refract in r3f?"

2. Agent thinks: someone has almost certainly built this already
   → Read resource examples://index
   → Several lines carry #transmission; "aquarium" and "caustics" look closest

3. Agent retrieves one of them:
   → Call tool get_example(name="caustics")

4. Agent has a working scene, and the drei version it was written against. If the
   answer turns on an API's current shape, it checks that against docs://drei/index
   rather than assuming the example is up to date.
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
          // Fail loudly: an unchecked 404 yields an empty index, which reads to a
          // client as "this library has no pages" and invites it to guess paths
          if (!response.ok) {
            throw new Error(
              `MCP server error: Failed to fetch ${url}/llms-full.txt: ${response.statusText}`,
            )
          }
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
    // Register the examples index
    //

    server.registerResource(
      'pmndrs examples index',
      'examples://index',
      {
        description:
          'The pmndrs example gallery: every published demo, one per line, with what it shows and what it is built with.',
        mimeType: 'text/plain',
      },
      async () => {
        return {
          contents: [
            {
              uri: 'examples://index',
              text: await fetchDocument(indexUrl()),
            },
          ],
        }
      },
    )

    //
    // Register get_page_content tool
    //

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
          url = `${await baseUrl()}`
        }

        try {
          const response = await fetch(`${url}/llms-full.txt`, {
            next: {
              revalidate: 300, // Cache for 5 minutes
              tags: [`llms-full-${lib}`],
            },
          })
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

    //
    // Register get_example tool
    //

    server.registerTool(
      'get_example',
      {
        title: 'Get Example',
        description:
          'Get a pmndrs example in full: what it demonstrates, the versions it is written against, and every source file.',
        inputSchema: {
          name: z
            .string()
            .describe('An example name taken verbatim from the examples://index resource'),
        },
      },
      async ({ name }) => {
        try {
          // The catalog is one file per example, so `name` reaches a URL. Keep it
          // to the shape every published example has rather than trusting it.
          return {
            content: [
              {
                type: 'text',
                text: await fetchDocument(exampleUrl(assertExampleName(name))),
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
