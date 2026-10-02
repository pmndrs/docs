// Real MCP traffic against a local server, to watch `/mcp/live` move.
//
// A handful of simulated clients, each with its own `clientInfo.name` and User-Agent, initialize
// and then call the server at random intervals: `get_page_content` on pages read from the
// libraries' own indexes, `get_example`, and the resources -- with a share of bad page paths, so
// failures show up too. Every request is a plain JSON-RPC POST, as an MCP client sends it.
//
// Run with Node's type stripping, against a running `pnpm dev`:
//   pnpm mcp:traffic
//   pnpm mcp:traffic --url http://localhost:3001/api/mcp --interval 300 --count 200

import { Command, Option } from 'commander'
import { libs } from '../src/libs.ts'

interface Client {
  name: string
  userAgent: string
}

// Names the way real clients announce themselves, and User-Agents the way they send them --
// some of which say who they are, some of which only say "node"
const CLIENTS: Client[] = [
  { name: 'claude-code', userAgent: 'claude-code/2.0.14 (external, cli)' },
  { name: 'Cursor', userAgent: 'Cursor/1.7.0 (darwin arm64)' },
  { name: 'Visual Studio Code', userAgent: 'Visual Studio Code/1.105.0' },
  { name: 'windsurf-client', userAgent: 'windsurf/1.12.0' },
  { name: 'mcp-inspector', userAgent: 'node' },
  { name: 'my-research-agent', userAgent: 'python-httpx/0.28.1' },
]

const LIBS = Object.entries(libs)
  .filter(([, lib]) => 'llms_full' in lib && lib.llms_full)
  .map(([name]) => name)

const program = new Command()
  .name('mcp-traffic')
  .description('Send a random mix of real MCP requests to a local server')
  .addOption(new Option('--url <url>', 'MCP endpoint').default('http://localhost:3000/api/mcp'))
  .addOption(
    new Option('--interval <ms>', 'mean delay between requests').default(800).argParser(Number),
  )
  .addOption(
    new Option('--count <n>', 'stop after this many requests (default: never)').argParser(Number),
  )
  .addOption(
    new Option('--error-rate <ratio>', 'share of page requests made with a bad path')
      .default(0.08)
      .argParser(Number),
  )
  .parse()

const options = program.opts<{
  url: string
  interval: number
  count?: number
  errorRate: number
}>()

let nextId = 0

/** One JSON-RPC message; a response comes back as JSON or as one SSE `message` event. */
async function rpc(client: Client, method: string, params?: unknown) {
  const isNotification = method.startsWith('notifications/')
  const response = await fetch(options.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Both, or the Streamable HTTP transport answers 406
      Accept: 'application/json, text/event-stream',
      'User-Agent': client.userAgent,
      'MCP-Protocol-Version': '2025-06-18',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      ...(isNotification ? {} : { id: ++nextId }),
      method,
      ...(params === undefined ? {} : { params }),
    }),
  })

  const text = await response.text()
  if (isNotification || !text) return { ok: response.ok, result: undefined }

  const json = response.headers.get('content-type')?.includes('text/event-stream')
    ? text
        .split('\n')
        .filter((line) => line.startsWith('data: '))
        .map((line) => line.slice('data: '.length))
        .join('')
    : text
  const message = JSON.parse(json) as { result?: Record<string, unknown>; error?: unknown }
  const ok = response.ok && !message.error && !message.result?.isError
  return { ok, result: message.result }
}

async function initialize(client: Client) {
  await rpc(client, 'initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: client.name, version: '1.0.0' },
  })
  await rpc(client, 'notifications/initialized')
}

function resourceText(result: Record<string, unknown> | undefined) {
  const contents = result?.contents as { text?: string }[] | undefined
  return contents?.[0]?.text ?? ''
}

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Exponentially distributed, like independent clients arriving. */
const delay = () => -Math.log(1 - Math.random()) * options.interval

async function main() {
  console.log(`Sending MCP traffic to ${options.url} -- Ctrl-C to stop`)

  for (const client of CLIENTS) await initialize(client)

  // Real page paths and example names, read the way a client would find them
  const pages = new Map<string, string[]>()
  for (const lib of LIBS) {
    const { result } = await rpc(CLIENTS[0], 'resources/read', { uri: `docs://${lib}/index` })
    const paths = resourceText(result)
      .split('\n')
      .map((line) => line.split(' - ')[0].trim())
      .filter((path) => path.startsWith('/'))
    if (paths.length > 0) pages.set(lib, paths)
    else console.warn(`  no index for ${lib}, skipping it`)
  }
  const { result: examplesIndex } = await rpc(CLIENTS[0], 'resources/read', {
    uri: 'examples://index',
  })
  const examples = resourceText(examplesIndex)
    .split('\n')
    .map((line) => line.split(' ')[0])
    .filter(Boolean)

  const libsWithPages = [...pages.keys()]
  if (libsWithPages.length === 0) throw new Error('No library index could be read')

  const actions: [weight: number, run: (client: Client) => Promise<string>][] = [
    [
      55,
      async (client) => {
        const lib = pick(libsWithPages)
        const path = Math.random() < options.errorRate ? '/does-not-exist' : pick(pages.get(lib)!)
        const { ok } = await rpc(client, 'tools/call', {
          name: 'get_page_content',
          arguments: { lib, path },
        })
        return `get_page_content ${lib} ${path} ${ok ? 'ok' : 'FAILED'}`
      },
    ],
    [
      15,
      async (client) => {
        const lib = pick(libsWithPages)
        const { ok } = await rpc(client, 'resources/read', { uri: `docs://${lib}/index` })
        return `docs://${lib}/index ${ok ? 'ok' : 'FAILED'}`
      },
    ],
    [
      15,
      async (client) => {
        const name = examples.length > 0 ? pick(examples) : 'caustics'
        const { ok } = await rpc(client, 'tools/call', {
          name: 'get_example',
          arguments: { name },
        })
        return `get_example ${name} ${ok ? 'ok' : 'FAILED'}`
      },
    ],
    [
      8,
      async (client) => {
        const { ok } = await rpc(client, 'resources/read', { uri: 'docs://pmndrs/manifest' })
        return `docs://pmndrs/manifest ${ok ? 'ok' : 'FAILED'}`
      },
    ],
    [
      7,
      async (client) => {
        const { ok } = await rpc(client, 'resources/read', { uri: 'examples://index' })
        return `examples://index ${ok ? 'ok' : 'FAILED'}`
      },
    ],
  ]
  const totalWeight = actions.reduce((sum, [weight]) => sum + weight, 0)
  const pickAction = () => {
    let roll = Math.random() * totalWeight
    for (const [weight, run] of actions) {
      roll -= weight
      if (roll < 0) return run
    }
    return actions[0][1]
  }

  for (let sent = 0; options.count === undefined || sent < options.count; sent++) {
    await sleep(delay())
    const client = pick(CLIENTS)
    const start = performance.now()
    // Not awaited: requests overlap, as they do with real clients
    pickAction()(client)
      .then((line) => {
        const ms = Math.round(performance.now() - start)
        console.log(`${client.name.padEnd(20)} ${line} (${ms} ms)`)
      })
      .catch((error) => console.error(`${client.name.padEnd(20)} ${error}`))
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
