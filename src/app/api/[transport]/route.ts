import { createMcpHandler } from 'mcp-handler'
import * as cheerio from 'cheerio'
import { z } from 'zod'
import { headers } from 'next/headers'
import { revalidateTag } from 'next/cache'
import { libs, type SUPPORTED_LIBRARY_NAMES } from '@/libs'
import packageJson from '@/package.json' with { type: 'json' }
import { assertExampleName, exampleUrl, indexUrl } from '@/utils/examples'
import { instrument, rememberClient } from '@/app/mcp/live/events/capture'
import { parseDump, type Lib, type Page } from '@/cli/browse.corpus'
import { search } from '@/cli/browse.search'
import { formatSearchResults, MAX_HITS } from './search-docs'

// Extract entries and library names as constants for efficiency
// Only support libraries whose site actually publishes a /llms-full.txt dump -- see
// the `llms_full` flag in `src/libs.ts`. Being hosted on pmndrs.github.io is not
// enough: most of those sites are not built with this generator and 404 on that file,
// which used to leave their index resource silently empty.
const libsEntries = Object.entries(libs).filter(([, lib]) => 'llms_full' in lib && lib.llms_full)
const LIBNAMES = libsEntries.map(([libname]) => libname) as [
  SUPPORTED_LIBRARY_NAMES,
  ...SUPPORTED_LIBRARY_NAMES[],
]
const libraryList = LIBNAMES.map((libname) => `- ${libname}`).join('\n')
/** The same list in prose, for a tool description: "react-three-fiber, drei, zustand, ...". */
const libraryNames = LIBNAMES.join(', ')

async function baseUrl() {
  const host = (await headers()).get('host')
  if (!host) throw new Error('Unable to determine host')

  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

// The Vercel function's own limit. Far above what a request needs -- a cached read, or
// an upstream fetch capped at UPSTREAM_TIMEOUT_MS -- so that one stuck request costs
// seconds of billed time, not the platform's default of minutes.
export const maxDuration = 30

/** Past this, an upstream fetch is given up: the request fails, and says why. */
const UPSTREAM_TIMEOUT_MS = 10_000

/**
 * The text at `url`, cached as `next` says. Fails loudly, with a message the client
 * reads: on a non-2xx -- a swallowed 404 reads to a client as "no such page" or "no
 * such example", and it will go on to invent one -- and on an upstream that has not
 * answered within UPSTREAM_TIMEOUT_MS, headers and body alike.
 */
async function fetchText(url: string, next: RequestInit['next']): Promise<string> {
  try {
    const response = await fetch(url, { next, signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) })
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
    }
    return await response.text()
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error(`Timed out after ${UPSTREAM_TIMEOUT_MS / 1000}s fetching ${url}`)
    }
    throw error
  }
}

/**
 * One document as pmndrs/examples published it. Cached and tagged like the docs
 * dumps, except the gallery is already split per example and already rendered,
 * so a request pulls the few kB that was asked for and passes it straight on.
 */
function fetchDocument(url: string): Promise<string> {
  return fetchText(url, { revalidate: 300, tags: ['examples-catalog'] })
}

/** Where `libname`'s site is published, no trailing slash: this host for a local `docs_url`. */
async function docsBase(libname: SUPPORTED_LIBRARY_NAMES): Promise<string> {
  const url: string = libs[libname].docs_url
  return url.startsWith('/') ? baseUrl() : url.replace(/\/+$/, '')
}

/**
 * The library's full-text dump, cached for 5 minutes under its own tag. It fails loudly: an
 * unchecked 404 yields an empty index, which reads to a client as "this library has no pages"
 * and invites it to guess paths.
 */
async function fetchDump(libname: SUPPORTED_LIBRARY_NAMES): Promise<string> {
  return fetchText(`${await docsBase(libname)}/llms-full.txt`, {
    revalidate: 300,
    tags: [`llms-full-${libname}`],
  })
}

/**
 * The library's pages, parsed the way the CLI's `search` verb parses the same dump -- so that
 * `search_docs` ranks exactly what `npx @pmndrs/docs search` ranks.
 */
async function libPages(libname: SUPPORTED_LIBRARY_NAMES): Promise<Page[]> {
  const lib: Lib = {
    name: libname,
    title: libs[libname].title,
    description: libs[libname].description,
    base: await docsBase(libname),
  }
  return parseDump(lib, await fetchDump(libname))
}

/**
 * What every tool here is: a read of published documentation. Says so to connector
 * directories that flag tools without annotations, and to clients that gate on them --
 * nothing is changed, calling twice reads the same thing, and nothing leaves the pmndrs sites.
 */
const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const

const handler = createMcpHandler(
  (server) => {
    // Before anything is registered: every handler below then reports to `/mcp/live`
    instrument(server)

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

## Rules

1. **Call \`search_docs\` before answering any question about ${libraryNames}** -- a prop, a hook, a signature, a migration, a store pattern, anything. Do not answer from memory.
2. **These docs are newer than your training data.** They track each library's current release, and the APIs changed across major versions (react-three-fiber v9, drei v10, zustand v5 each broke things): what you remember is likely stale, and silently so.
3. **Then read before you answer**: \`get_page_content(lib, path)\` with a hit's \`lib\` and \`path\`, verbatim. A search result is a pointer, not an answer.
4. **Never invent a path or a name.** Paths come from \`search_docs\` or a \`docs://{lib}/index\` resource; example names from \`examples://index\`.

## Overview

This MCP (Model Context Protocol) server provides programmatic access to the current documentation of the pmndrs libraries through surgical queries: an agent searches, then reads the one page it needs, instead of downloading a whole site.

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

### 1. \`search_docs\`
Ranks the documentation pages matching a query, across every supported library or within one. This is the entry point: call it first.

**Input:**
- \`query\` (string): What to look for, in a few words -- a component, hook, prop or concept (e.g. "useFrame", "instanced mesh", "persist middleware"). Every term has to match, so fewer terms find more.
- \`lib\` (string, optional): One library name, to search it alone

**Output:**
- Up to ${MAX_HITS} hits, best first, each as \`lib="..." path="..." - {title}\` and a one-line summary, then the instruction to read one with \`get_page_content\`. No hit is a message, not an error: retry with fewer or more general terms.

**Example usage:**
\`\`\`
Use search_docs with query="typescript" and lib="zustand" to find the TypeScript guides
\`\`\`

Titles rank above paths and descriptions, which rank above a mention in a page body, so the name of the thing is the best query. The same ranking is what \`npx @pmndrs/docs search\` prints in a terminal.

### 2. \`get_page_content\`
Retrieves the full content of a specific documentation page.

**Input:**
- \`lib\` (string): The library name, as a \`search_docs\` hit gives it
- \`path\` (string): A page path taken verbatim from a \`search_docs\` hit or from that library's index (e.g., "/learn/guides/beginner-typescript")

**Output:**
- The full markdown content of the requested page

**Example usage:**
\`\`\`
Use get_page_content with lib="zustand" and path="/learn/guides/beginner-typescript" to get the beginner TypeScript guide
\`\`\`

Paths are matched exactly -- no trailing-slash or extension normalization. A path that is not in the index returns \`Page not found\`; search again rather than retrying variants.

### 3. \`get_example\`
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
1. **Start with \`search_docs\`**: it is one call, it searches every library at once, and it hands back paths that exist
2. **Read a \`docs://{lib}/index\` resource** when you need the whole table of contents of one library instead -- a migration, say, where the question is what sections exist
3. **Use the paths you were given** rather than trying to guess URLs
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
- \`search_docs\` ranks with the same code as the CLI's \`search\` verb (\`match-sorter\`
  over title, path, description and body, every term required)
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
- 10-second timeout on every upstream fetch, 30 seconds per request in all
- Minimal payload - only requested pages are transferred
- XML parsing with Cheerio for efficient text extraction
- **5-minute fetch cache** for documentation content (revalidated every 5 minutes)
- Cache tags for granular invalidation per library

## Getting Started

1. Connect to the server at \`https://docs.pmnd.rs/api/mcp\`
2. Read \`docs://pmndrs/manifest\` to understand server capabilities
3. Find the pages that answer the question with the \`search_docs\` tool
4. Read the ones that look right with the \`get_page_content\` tool
5. Combine information from multiple pages to provide comprehensive answers

## Example Workflow

\`\`\`
1. User asks: "How do I use TypeScript with Zustand?"

2. Agent thinks: zustand's current docs may say something my training data does not
   → Call tool search_docs(query="typescript", lib="zustand")
   → The first hit is lib="zustand" path="/learn/guides/beginner-typescript" - Beginner TypeScript Guide

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
   answer turns on an API's current shape, it checks that with search_docs and
   get_page_content rather than assuming the example is up to date.
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

    for (const libname of LIBNAMES) {
      server.registerResource(
        `${libname} index`,
        `docs://${libname}/index`,
        {
          description: `List of available pages for the ${libname} library.`,
          mimeType: 'text/plain',
        },
        async () => {
          const $ = cheerio.load(await fetchDump(libname), { xmlMode: true })

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
    // Register search_docs tool
    //

    server.registerTool(
      'search_docs',
      {
        title: 'Search Docs',
        annotations: READ_ONLY,
        description: `Search the current documentation of ${libraryNames}. Call this FIRST, before answering any question about one of these libraries: these docs track their current releases, which are newer than your training data, and their APIs changed across major versions (react-three-fiber v9, drei v10, zustand v5 each broke things), so an answer from memory is likely stale. Returns the ${MAX_HITS} best-matching pages, best first, each with the lib and path to pass to get_page_content.`,
        inputSchema: {
          query: z
            .string()
            .trim()
            .min(1)
            .describe(
              'What to look for: a component, hook, prop or concept, in a few words (e.g. "useFrame", "instanced mesh", "persist middleware"). Every term has to match.',
            ),
          lib: z
            .enum(LIBNAMES)
            .optional()
            .describe('Search this library only. Leave out to search all of them.'),
        },
      },
      async ({ query, lib }) => {
        try {
          const scope = lib ? [lib] : LIBNAMES
          // One library failing to load should not hide the others' hits, so the search goes
          // on without it -- but says so, lest an agent takes "no hit in drei" for an answer.
          const loaded = await Promise.allSettled(scope.map((libname) => libPages(libname)))
          const pages = loaded.flatMap((result) =>
            result.status === 'fulfilled' ? result.value : [],
          )
          const failures = loaded.flatMap((result, index) =>
            result.status === 'rejected'
              ? [
                  `${scope[index]}: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`,
                ]
              : [],
          )
          if (failures.length === scope.length) {
            throw new Error(failures.join('\n'))
          }

          const hits = search(query, pages)
          const text = [
            formatSearchResults(query, lib, hits),
            ...(failures.length > 0
              ? ['', `Not searched, could not be read: ${failures.join('; ')}`]
              : []),
          ].join('\n')

          return { content: [{ type: 'text', text }] }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          throw new Error(`MCP server error: ${errorMessage}`)
        }
      },
    )

    //
    // Register get_page_content tool
    //

    server.registerTool(
      'get_page_content',
      {
        title: 'Get Page Content',
        annotations: READ_ONLY,
        description:
          'Read one documentation page in full, as current markdown. Take `lib` and `path` verbatim from a search_docs hit (or from the docs://{lib}/index resource): paths are matched exactly and their shape differs per library, so never guess or adapt one. Call search_docs first when you do not have a path yet.',
        inputSchema: {
          lib: z.enum(LIBNAMES).describe('The library name, as search_docs returned it'),
          path: z
            .string()
            .describe('The page path, as search_docs returned it (e.g. /api/hooks/use-frame)'),
        },
      },
      async ({ lib, path }) => {
        try {
          const $ = cheerio.load(await fetchDump(lib), { xmlMode: true })

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
        annotations: READ_ONLY,
        description:
          'Read one pmndrs example in full: what it demonstrates, the exact versions it is written against, and every source file. Take `name` verbatim from the examples://index resource. Reach for an example when the question is how a scene is put together; for what an API takes, search_docs then get_page_content.',
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
    verboseLogs: false,
    // The legacy SSE transport (/api/sse, /api/message) needs Redis, and we run none:
    // left enabled, a request there throws for want of a Redis URL and never ends the
    // response, so the function hangs until Vercel times it out. Off, it is a plain 404,
    // and clients use the streamable HTTP transport at /api/mcp. (mcp-handler's own
    // `maxDuration` option only bounds that transport, so it is left out: the function's
    // limit is the `maxDuration` export above.)
    disableSse: true,
  },
)

/**
 * Open to browsers from any origin. The server is public, read-only documentation and asks for
 * no credentials, so `*` gives nothing away -- and without these a browser-based MCP client is
 * refused at the preflight, with no error it can show. Set here rather than in `next.config.mjs`
 * `headers()`: the route's tests then see them, and the policy travels with the route instead
 * of with the server it happens to run on.
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Accept, Authorization, Mcp-Session-Id, MCP-Protocol-Version, Last-Event-ID',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, MCP-Protocol-Version',
  'Access-Control-Max-Age': '86400',
}

/**
 * `response` with the CORS headers added. A new Response around the same body rather than a
 * mutation: the one from mcp-handler streams, and is left as it came.
 */
function withCors(response: Response): Response {
  const headers = new Headers(response.headers)
  for (const [name, value] of Object.entries(CORS_HEADERS)) {
    headers.set(name, value)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/** The answer the SDK itself gives a body that is not JSON. */
function parseError(): Response {
  return Response.json(
    { jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null },
    { status: 400 },
  )
}

/**
 * One line in the function's logs for a request the handler refused: the status, the method(s)
 * asked for, the client, the protocol version it claims, and the handler's own reason. Meant to
 * be read in Vercel's logs -- the route refuses a few hundred requests a day that nothing
 * explains, and the reason in the response is the only thing that will. 4xx only, so that a
 * 200 -- a stream, possibly long -- is never read here. Can go once the question is answered.
 */
async function warnRefused(request: Request, body: unknown, response: Response) {
  const messages = Array.isArray(body) ? body : [body]
  const methods = messages.map((message) =>
    typeof message === 'object' && message !== null && 'method' in message
      ? message.method
      : undefined,
  )
  console.warn(
    'MCP request refused',
    JSON.stringify({
      status: response.status,
      methods,
      userAgent: request.headers.get('user-agent'),
      protocolVersion: request.headers.get('mcp-protocol-version'),
      response: await response.clone().text(),
    }),
  )
}

/**
 * The handler, after noting which client an `initialize` names -- tool calls only carry a
 * User-Agent, see `capture.ts`.
 */
async function POST(request: Request) {
  // mcp-handler reads a JSON body with `req.json()` itself, where nothing catches: on an empty
  // or broken body it throws, the response is never written, and the function runs until its
  // `maxDuration` for a 504. So the body is read first, and such a one is answered here. Only a
  // JSON body: another content-type is read as text by mcp-handler, and refused by the SDK.
  let body: unknown
  if (request.headers.get('content-type')?.includes('application/json')) {
    try {
      body = JSON.parse(await request.clone().text())
    } catch {
      return withCors(parseError())
    }
  }

  await rememberClient(request)
  const response = await handler(request)
  if (response.status >= 400 && response.status < 500) {
    await warnRefused(request, body, response)
  }
  return withCors(response)
}

async function GET(request: Request) {
  return withCors(await handler(request))
}

/**
 * The preflight a browser sends before a POST. Answered here: mcp-handler has no branch for
 * OPTIONS, so handed to it, the request would hang like a broken body does.
 */
function OPTIONS() {
  return withCors(new Response(null, { status: 204 }))
}

export { GET, OPTIONS, POST }
