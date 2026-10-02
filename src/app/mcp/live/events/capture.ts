import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { after } from 'next/server'
import type { McpEvent } from '@/app/mcp/live/_components/event'
import { createEventId, getEventBus, type McpEventBus } from './bus'

/**
 * Turns every tool call and resource read of an MCP server into an `McpEvent` on the bus.
 *
 * ## Which client sent it
 *
 * `server.server.getClientVersion()` cannot tell: mcp-handler runs the Streamable HTTP
 * transport stateless, with one `McpServer` per instance shared by every client, and the SDK
 * keeps the `clientInfo` of whichever `initialize` came last -- a tool call would be credited to
 * the most recent client to connect, not to its own.
 *
 * What a request does carry is its User-Agent, which the SDK hands each handler in
 * `extra.requestInfo.headers`. So the client is resolved from that, the first of these that answers:
 * 1. the `clientInfo.name` an `initialize` sent with this exact User-Agent, on this instance --
 *    see `rememberClient`, which the route calls with every POST before handing it on -- unless
 *    clients announcing different names share that User-Agent ("node", say);
 * 2. else a short token read from the User-Agent itself ("claude-code", "cursor", "node");
 * 3. else "unknown".
 */

type Headers = Record<string, string | string[] | undefined>

/** The part of the SDK's `RequestHandlerExtra` this module reads. */
interface Extra {
  requestInfo?: { headers?: Headers }
}

const MAX_NAME_LENGTH = 32

/** Lowercase, dash-separated, short: "Claude Desktop" -> "claude-desktop". */
export function normalizeClientName(name: string): string | undefined {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_NAME_LENGTH)
  return normalized || undefined
}

/** Clients whose User-Agent says who they are somewhere other than in its first token. */
const KNOWN_USER_AGENTS: [RegExp, string][] = [
  [/claude[-_ ]?code/i, 'claude-code'],
  [/claude/i, 'claude'],
  [/cursor/i, 'cursor'],
  [/windsurf/i, 'windsurf'],
  [/vscode|visual studio code/i, 'vscode'],
  [/codex/i, 'codex'],
  [/mozilla\//i, 'browser'],
]

/** "claude-code/2.0.14 (cli)" -> "claude-code", "python-httpx/0.28.1" -> "python-httpx". */
export function clientFromUserAgent(userAgent: string | undefined): string | undefined {
  if (!userAgent) return undefined
  for (const [pattern, name] of KNOWN_USER_AGENTS) {
    if (pattern.test(userAgent)) return name
  }
  const product = /^\s*([a-z0-9][a-z0-9._-]*)/i.exec(userAgent)?.[1]
  return product ? normalizeClientName(product) : undefined
}

//
// `clientInfo.name` by User-Agent, learnt from `initialize` requests -- `null` for a User-Agent
// that several names were announced with, which then says nothing about which one it is
//

const MAX_REMEMBERED_CLIENTS = 256
const CLIENTS_KEY = Symbol.for('@pmndrs/docs/mcp-clients-by-user-agent')

function rememberedClients(): Map<string, string | null> {
  const global = globalThis as typeof globalThis & { [CLIENTS_KEY]?: Map<string, string | null> }
  global[CLIENTS_KEY] ??= new Map()
  return global[CLIENTS_KEY]
}

function isInitialize(message: unknown): message is { params: { clientInfo: { name: string } } } {
  if (typeof message !== 'object' || message === null) return false
  const { method, params } = message as { method?: unknown; params?: { clientInfo?: unknown } }
  const clientInfo = params?.clientInfo as { name?: unknown } | undefined
  return method === 'initialize' && typeof clientInfo?.name === 'string'
}

/**
 * Remembers the client name an `initialize` request announces, against its User-Agent. Reads a
 * clone, so the request is left for the MCP handler untouched; anything unexpected is ignored.
 */
export async function rememberClient(request: Request) {
  const userAgent = request.headers.get('user-agent')
  if (!userAgent || !request.headers.get('content-type')?.includes('application/json')) return

  let body: unknown
  try {
    const text = await request.clone().text()
    // Every tool call comes through here: only an `initialize` is worth parsing
    if (!text.includes('"initialize"')) return
    body = JSON.parse(text)
  } catch {
    return
  }

  for (const message of Array.isArray(body) ? body : [body]) {
    if (!isInitialize(message)) continue
    const name = normalizeClientName(message.params.clientInfo.name)
    if (!name) continue

    const clients = rememberedClients()
    const known = clients.get(userAgent)
    clients.delete(userAgent) // re-inserted last: the Map's order is the eviction order
    clients.set(userAgent, known === undefined || known === name ? name : null)
    if (clients.size > MAX_REMEMBERED_CLIENTS) {
      clients.delete(clients.keys().next().value!)
    }
  }
}

export function resolveClient(headers: Headers | undefined): string {
  const header = headers?.['user-agent']
  const userAgent = Array.isArray(header) ? header[0] : header
  if (!userAgent) return 'unknown'
  return rememberedClients().get(userAgent) ?? clientFromUserAgent(userAgent) ?? 'unknown'
}

//
// What each request was about
//

type Details = Pick<McpEvent, 'name' | 'lib' | 'path'>

/**
 * Only identifiers are kept. A page path or example name is free text until it resolves, so it
 * is recorded only once the call succeeded -- that is, once it is known to name a real page. A
 * search query never resolves to one thing, so it is never recorded: a search is about its
 * library, when it names one, and nothing more.
 */
function describeTool(name: string, args: unknown, ok: boolean): Details {
  const input = (typeof args === 'object' && args !== null ? args : {}) as Record<string, unknown>
  const text = (value: unknown) => (typeof value === 'string' ? value : undefined)

  switch (name) {
    case 'search_docs':
      return { name, lib: text(input.lib) }
    case 'get_page_content':
      return { name, lib: text(input.lib), path: ok ? text(input.path) : undefined }
    case 'get_example':
      return { name, lib: 'examples', path: ok ? text(input.name) : undefined }
    default:
      return { name }
  }
}

function describeResource(uri: string): Details {
  const docsIndex = /^docs:\/\/([^/]+)\/index$/.exec(uri)
  if (docsIndex) return { name: 'docs://{lib}/index', lib: docsIndex[1] }
  if (uri.startsWith('examples://')) return { name: uri, lib: 'examples' }
  return { name: uri }
}

//
// The wrapping itself
//

type Callback = (...args: unknown[]) => unknown

function isErrorResult(result: unknown) {
  return typeof result === 'object' && result !== null && 'isError' in result && !!result.isError
}

function capture(
  bus: McpEventBus,
  kind: McpEvent['kind'],
  describe: (args: unknown[], ok: boolean) => Details,
  callback: Callback,
): Callback {
  return async (...args) => {
    // The SDK passes `extra` last, whatever comes before it: `(args, extra)` for a tool with an
    // input schema, `(extra)` for one without, `(uri, extra)` or `(uri, variables, extra)` for
    // a resource.
    const extra = args.at(-1) as Extra | undefined
    const ts = Date.now()
    const start = performance.now()

    const publish = (ok: boolean) => {
      try {
        const published = bus.publish({
          id: createEventId(ts),
          ts,
          client: resolveClient(extra?.requestInfo?.headers),
          kind,
          ...describe(args, ok),
          durationMs: Math.round(performance.now() - start),
          ok,
        })
        // Not awaited, so the call does not wait for Redis -- but kept alive past the response:
        // Vercel suspends the instance once the response is sent, and a publish still opening
        // its connection then would never complete.
        after(published)
      } catch (error) {
        // Observing a request must never be what fails it
        console.error('Failed to publish MCP event:', error)
      }
    }

    try {
      const result = await callback(...args)
      publish(!isErrorResult(result))
      return result
    } catch (error) {
      publish(false)
      throw error
    }
  }
}

/**
 * Wraps `registerTool` and `registerResource` on this server instance, so every handler
 * registered afterwards publishes an event when it runs. Call it first thing in the server's
 * initializer.
 */
export function instrument<T extends McpServer>(server: T, bus: McpEventBus = getEventBus()): T {
  const registerTool = server.registerTool.bind(server) as unknown as (
    name: string,
    config: unknown,
    callback: Callback,
  ) => unknown
  const registerResource = server.registerResource.bind(server) as unknown as (
    name: string,
    uri: unknown,
    config: unknown,
    callback: Callback,
  ) => unknown

  server.registerTool = ((name: string, config: unknown, callback: Callback) =>
    registerTool(
      name,
      config,
      capture(
        bus,
        'tool',
        (args, ok) => describeTool(name, args.length > 1 ? args[0] : {}, ok),
        callback,
      ),
    )) as unknown as T['registerTool']

  server.registerResource = ((name: string, uri: unknown, config: unknown, callback: Callback) =>
    registerResource(
      name,
      uri,
      config,
      capture(bus, 'resource', (args) => describeResource(String(args[0])), callback),
    )) as unknown as T['registerResource']

  return server
}
