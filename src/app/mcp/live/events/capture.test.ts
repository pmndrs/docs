import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { McpEvent } from '@/app/mcp/live/_components/event'
import { getEventBus } from './bus'
import { clientFromUserAgent, normalizeClientName, resolveClient } from './capture'

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: vi.fn((key: string) => (key === 'host' ? 'docs.pmnd.rs' : null)),
  })),
}))

const llmsFull = `
<page path="/api/hooks/use-frame" title="useFrame Hook">
# useFrame Hook
</page>
`

const server = setupServer(
  http.get('https://pmndrs.github.io/react-three-fiber/llms-full.txt', () =>
    HttpResponse.text(llmsFull),
  ),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

let id = 0

async function rpc(method: string, params: unknown, userAgent: string) {
  const { POST } = await import('@/app/api/[transport]/route')
  const response = await POST(
    new Request('https://docs.pmnd.rs/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        'User-Agent': userAgent,
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }),
    }),
  )
  return response.text()
}

/** Runs `request` and returns what it published on the bus. */
async function published(request: () => Promise<unknown>) {
  const events: McpEvent[] = []
  const unsubscribe = getEventBus().subscribe((event) => events.push(event))
  try {
    await request()
  } finally {
    unsubscribe()
  }
  return events
}

const initialize = (name: string, userAgent: string) =>
  rpc(
    'initialize',
    {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name, version: '1.0.0' },
    },
    userAgent,
  )

describe('capture', () => {
  it('publishes an event for a tool call', async () => {
    const events = await published(() =>
      rpc(
        'tools/call',
        {
          name: 'get_page_content',
          arguments: { lib: 'react-three-fiber', path: '/api/hooks/use-frame' },
        },
        'claude-code/2.0.14 (cli)',
      ),
    )

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      client: 'claude-code',
      kind: 'tool',
      name: 'get_page_content',
      lib: 'react-three-fiber',
      path: '/api/hooks/use-frame',
      ok: true,
    })
    expect(events[0].durationMs).toBeGreaterThanOrEqual(0)
    expect(getEventBus().recent()).toContainEqual(events[0])
  })

  it('records a failed call without its free-text path', async () => {
    const [event] = await published(() =>
      rpc(
        'tools/call',
        {
          name: 'get_page_content',
          arguments: { lib: 'react-three-fiber', path: '/my secret question' },
        },
        'node',
      ),
    )

    expect(event).toMatchObject({ client: 'node', lib: 'react-three-fiber', ok: false })
    expect(event.path).toBeUndefined()
  })

  it('publishes an event for a resource read, generalizing the library away', async () => {
    const [event] = await published(() =>
      rpc('resources/read', { uri: 'docs://react-three-fiber/index' }, 'Cursor/1.7.0'),
    )

    expect(event).toMatchObject({
      client: 'cursor',
      kind: 'resource',
      name: 'docs://{lib}/index',
      lib: 'react-three-fiber',
      ok: true,
    })
  })

  it('credits each call to the client that initialized with its User-Agent', async () => {
    // Two clients behind the same kind of runtime, initializing one after the other on the one
    // stateless server: getClientVersion() would now answer "second-agent" for both.
    await initialize('First Agent', 'node-fetch/1.0 (first)')
    await initialize('second-agent', 'node-fetch/1.0 (second)')

    const events = await published(() =>
      rpc('resources/read', { uri: 'docs://pmndrs/manifest' }, 'node-fetch/1.0 (first)'),
    )

    expect(events[0]).toMatchObject({
      client: 'first-agent',
      kind: 'resource',
      name: 'docs://pmndrs/manifest',
      ok: true,
    })
    expect(events[0].lib).toBeUndefined()
  })

  it('falls back to the User-Agent when clients announcing different names share it', async () => {
    // A generic User-Agent: the second `initialize` must not take over the first one's calls
    await initialize('Third Agent', 'python-httpx/0.28.1')
    await initialize('Fourth Agent', 'python-httpx/0.28.1')

    const events = await published(() =>
      rpc('resources/read', { uri: 'docs://pmndrs/manifest' }, 'python-httpx/0.28.1'),
    )

    expect(events[0]).toMatchObject({ client: 'python-httpx' })
  })
})

describe('client names', () => {
  it.each([
    ['claude-code/2.0.14 (external, cli)', 'claude-code'],
    ['Cursor/1.7.0 (darwin arm64)', 'cursor'],
    ['node', 'node'],
    ['python-httpx/0.28.1', 'python-httpx'],
    ['Mozilla/5.0 (Macintosh)', 'browser'],
    ['', undefined],
    [undefined, undefined],
  ])('reads %j as %j', (userAgent, expected) => {
    expect(clientFromUserAgent(userAgent)).toBe(expected)
  })

  it('normalizes announced names', () => {
    expect(normalizeClientName('  Claude Desktop ')).toBe('claude-desktop')
    expect(normalizeClientName('???')).toBeUndefined()
    expect(normalizeClientName('x'.repeat(100))).toHaveLength(32)
  })

  it('falls back to "unknown"', () => {
    expect(resolveClient(undefined)).toBe('unknown')
    expect(resolveClient({ 'user-agent': '' })).toBe('unknown')
  })
})
