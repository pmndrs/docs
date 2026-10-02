import { describe, expect, it } from 'vitest'
import { createMemoryStatsStore, dayOf, fieldsFor, lastDays, record, toDailyStats } from './store'

const NOON = Date.UTC(2026, 9, 2, 12) // 2026-10-02T12:00:00Z

describe('days', () => {
  it('names the UTC day', () => {
    expect(dayOf(NOON)).toBe('2026-10-02')
    expect(dayOf(Date.UTC(2026, 9, 2, 23, 59, 59))).toBe('2026-10-02')
    expect(dayOf(Date.UTC(2026, 9, 3, 0, 0, 0))).toBe('2026-10-03')
  })

  it('lists the last days oldest first, ending today', () => {
    expect(lastDays(3, NOON)).toEqual(['2026-09-30', '2026-10-01', '2026-10-02'])
    expect(lastDays(1, NOON)).toEqual(['2026-10-02'])
  })
})

describe('fieldsFor', () => {
  it('counts a handshake by client, and by version when known', () => {
    expect(fieldsFor({ kind: 'connection', client: 'cursor', version: '1.7.0' })).toEqual([
      'connections',
      'client:cursor',
      'clientVersion:cursor/1.7.0',
    ])
    expect(fieldsFor({ kind: 'connection', client: 'cursor' })).toEqual([
      'connections',
      'client:cursor',
    ])
  })

  it('counts a tool call by tool and library, and its failure', () => {
    expect(fieldsFor({ kind: 'tool', name: 'get_page_content', lib: 'drei', ok: true })).toEqual([
      'calls',
      'tool:get_page_content',
      'lib:drei',
    ])
    expect(fieldsFor({ kind: 'tool', name: 'get_example', ok: false })).toEqual([
      'calls',
      'tool:get_example',
      'errors',
    ])
  })

  it('counts a resource read', () => {
    expect(fieldsFor({ kind: 'resource' })).toEqual(['reads'])
  })
})

describe('createMemoryStatsStore', () => {
  it('increments the fields of the day a hit is recorded on', async () => {
    const store = createMemoryStatsStore()

    await record(store, { kind: 'connection', client: 'cursor', version: '1.7.0' }, NOON)
    await record(store, { kind: 'tool', name: 'get_page_content', lib: 'drei', ok: true }, NOON)
    await record(store, { kind: 'tool', name: 'get_page_content', lib: 'drei', ok: false }, NOON)
    await record(store, { kind: 'resource' }, NOON + 60_000)
    // The day after
    await record(store, { kind: 'tool', name: 'get_example', ok: true }, NOON + 86_400_000)

    expect(await store.read(['2026-10-02', '2026-10-03', '2026-10-04'])).toEqual([
      {
        connections: 1,
        'client:cursor': 1,
        'clientVersion:cursor/1.7.0': 1,
        calls: 2,
        'tool:get_page_content': 2,
        'lib:drei': 2,
        errors: 1,
        reads: 1,
      },
      { calls: 1, 'tool:get_example': 1 },
      {},
    ])
  })

  it('hands out copies', async () => {
    const store = createMemoryStatsStore()
    await store.increment('2026-10-02', ['calls'])

    const [hash] = await store.read(['2026-10-02'])
    hash.calls = 100

    expect(await store.read(['2026-10-02'])).toEqual([{ calls: 1 }])
  })
})

describe('toDailyStats', () => {
  it('splits a hash into totals and breakdowns', () => {
    expect(
      toDailyStats('2026-10-02', {
        connections: 3,
        'client:cursor': 2,
        'client:claude-code': 1,
        'clientVersion:cursor/1.7.0': 2,
        calls: 5,
        'tool:get_page_content': 4,
        'tool:get_example': 1,
        'lib:drei': 3,
        'lib:examples': 1,
        reads: 7,
        errors: 1,
      }),
    ).toEqual({
      date: '2026-10-02',
      connections: 3,
      calls: 5,
      reads: 7,
      errors: 1,
      clients: { cursor: 2, 'claude-code': 1 },
      tools: { get_page_content: 4, get_example: 1 },
      libs: { drei: 3, examples: 1 },
    })
  })

  it('reads an empty hash as zeros', () => {
    expect(toDailyStats('2026-10-02', {})).toEqual({
      date: '2026-10-02',
      connections: 0,
      calls: 0,
      reads: 0,
      errors: 0,
      clients: {},
      tools: {},
      libs: {},
    })
  })
})
