import { describe, expect, it } from 'vitest'
import { DEFAULT_DAYS, MAX_DAYS, type McpStatsPayload } from '@/app/mcp/live/_components/stats'
import { CACHE_HEADERS, parseDays, statsResponse } from './response'
import { createMemoryStatsStore, record } from './store'

const NOON = Date.UTC(2026, 9, 2, 12) // 2026-10-02T12:00:00Z
const DAY_MS = 86_400_000

async function body(response: Response) {
  return ((await response.json()) as McpStatsPayload).days
}

describe('parseDays', () => {
  it.each([
    ['', DEFAULT_DAYS],
    ['days=7', 7],
    ['days=0', 1],
    ['days=-3', 1],
    ['days=9999', MAX_DAYS],
    ['days=abc', DEFAULT_DAYS],
  ])('reads %j as %i', (query, expected) => {
    expect(parseDays(new URLSearchParams(query))).toBe(expected)
  })
})

describe('statsResponse', () => {
  it('returns one entry per day, oldest first, with zeros for a day without any', async () => {
    const store = createMemoryStatsStore()
    await record(store, { kind: 'connection', client: 'cursor', version: '1.7.0' }, NOON)
    await record(store, { kind: 'tool', name: 'get_page_content', lib: 'drei', ok: true }, NOON)
    await record(store, { kind: 'tool', name: 'get_example', ok: false }, NOON - 2 * DAY_MS)
    await record(store, { kind: 'resource' }, NOON - 2 * DAY_MS)

    const response = await statsResponse(store, new URLSearchParams('days=3'), NOON)

    expect(response.status).toBe(200)
    expect(await body(response)).toEqual([
      {
        date: '2026-09-30',
        connections: 0,
        calls: 1,
        reads: 1,
        errors: 1,
        clients: {},
        tools: { get_example: 1 },
        libs: {},
      },
      {
        date: '2026-10-01',
        connections: 0,
        calls: 0,
        reads: 0,
        errors: 0,
        clients: {},
        tools: {},
        libs: {},
      },
      {
        date: '2026-10-02',
        connections: 1,
        calls: 1,
        reads: 0,
        errors: 0,
        clients: { cursor: 1 },
        tools: { get_page_content: 1 },
        libs: { drei: 1 },
      },
    ])
  })

  it(`returns ${DEFAULT_DAYS} days by default`, async () => {
    const days = await body(await statsResponse(createMemoryStatsStore(), new URLSearchParams()))
    expect(days).toHaveLength(DEFAULT_DAYS)
  })

  it('is cacheable by the CDN for a minute, and not by the browser', async () => {
    const response = await statsResponse(createMemoryStatsStore(), new URLSearchParams())

    expect(response.headers.get('Content-Type')).toMatch(/^application\/json/)
    expect(response.headers.get('Cache-Control')).toBe(CACHE_HEADERS['Cache-Control'])
    expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe(
      'max-age=60, stale-while-revalidate=60',
    )
    expect(response.headers.has('Set-Cookie')).toBe(false)
    expect(response.headers.has('Vary')).toBe(false)
  })
})

describe('GET /mcp/live/stats', () => {
  it('answers from the shared store, as many days as asked', async () => {
    const { GET } = await import('./route')

    const response = await GET(new Request('https://docs.pmnd.rs/mcp/live/stats?days=7'))

    expect(await body(response)).toHaveLength(7)
    expect(response.headers.get('Vercel-CDN-Cache-Control')).toMatch(/max-age=60/)
  })
})
