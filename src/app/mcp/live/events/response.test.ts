import { describe, expect, it } from 'vitest'
import {
  RECENT_LIMIT,
  WINDOW_PARAM,
  type McpEvent,
  type McpEventsPayload,
} from '@/app/mcp/live/_components/event'
import { createEventId, createMemoryEventBus } from './bus'
import { CACHE_HEADERS, eventsResponse } from './response'

function event(index: number): McpEvent {
  const ts = Date.now()
  return {
    id: createEventId(ts),
    ts,
    client: 'test',
    kind: 'tool',
    name: 'get_page_content',
    lib: 'drei',
    path: `/${index}`,
    durationMs: 1,
    ok: true,
  }
}

function busWith(count: number) {
  const bus = createMemoryEventBus()
  const events = Array.from({ length: count }, (_, index) => event(index))
  events.forEach((e) => bus.publish(e))
  return { bus, events }
}

async function body(response: Response) {
  return ((await response.json()) as McpEventsPayload).events
}

describe('eventsResponse', () => {
  it('returns the newest `RECENT_LIMIT` events, oldest first', async () => {
    const { bus, events } = busWith(RECENT_LIMIT + 20)

    const response = await eventsResponse(bus, new URLSearchParams())

    expect(response.status).toBe(200)
    expect(await body(response)).toEqual(events.slice(-RECENT_LIMIT))
  })

  it('returns the whole window with `?window`', async () => {
    const { bus, events } = busWith(RECENT_LIMIT + 20)

    const response = await eventsResponse(bus, new URLSearchParams(WINDOW_PARAM))

    expect(await body(response)).toEqual(events)
  })

  it('is cacheable by the CDN, and not by the browser', async () => {
    const { bus } = busWith(1)

    const response = await eventsResponse(bus, new URLSearchParams())

    expect(response.headers.get('Content-Type')).toMatch(/^application\/json/)
    expect(response.headers.get('Cache-Control')).toBe(CACHE_HEADERS['Cache-Control'])
    expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe(
      'max-age=2, stale-while-revalidate=5',
    )
    expect(response.headers.has('Set-Cookie')).toBe(false)
    expect(response.headers.has('Vary')).toBe(false)
  })
})

describe('GET /mcp/live/events', () => {
  it('answers every viewer alike, whatever else the URL carries', async () => {
    const { GET } = await import('./route')

    const plain = await GET(new Request('https://docs.pmnd.rs/mcp/live/events'))
    const other = await GET(new Request('https://docs.pmnd.rs/mcp/live/events?lastEventId=x'))

    expect(await plain.json()).toEqual(await other.json())
    expect(plain.headers.get('Vercel-CDN-Cache-Control')).toMatch(/max-age=2/)
  })
})
