import { describe, expect, it } from 'vitest'
import { RECENT_LIMIT, WINDOW_MS, type McpEvent } from './event'
import { MAX_EVENTS, mergeEvents, missesEvents, prune, replayDelays, windowUrl } from './merge'

const NOW = WINDOW_MS * 2

function event(id: string, ts = NOW): McpEvent {
  return { id, ts, client: 'test', kind: 'tool', name: 'get_page_content', durationMs: 1, ok: true }
}

const ids = (events: McpEvent[]) => events.map(({ id }) => id)

describe('mergeEvents', () => {
  it('appends what is new, and reports it as fresh', () => {
    const current = [event('a', NOW - 2), event('b', NOW - 1)]

    const { events, fresh } = mergeEvents(current, [event('b', NOW - 1), event('c')], NOW)

    expect(ids(events)).toEqual(['a', 'b', 'c'])
    expect(ids(fresh)).toEqual(['c'])
  })

  it('never keeps an event twice, even within one answer', () => {
    const { events, fresh } = mergeEvents([], [event('a'), event('a'), event('b')], NOW)

    expect(ids(events)).toEqual(['a', 'b'])
    expect(ids(fresh)).toEqual(['a', 'b'])
  })

  it('keeps events in order of time, then of id', () => {
    const current = [event('b', NOW - 10), event('d', NOW)]

    const { events, fresh } = mergeEvents(
      current,
      [event('c', NOW - 5), event('a', NOW - 10), event('e', NOW - 5)],
      NOW,
    )

    expect(ids(events)).toEqual(['a', 'b', 'c', 'e', 'd'])
    expect(ids(fresh)).toEqual(['a', 'c', 'e'])
  })

  it('returns `current` itself when nothing changed', () => {
    const current = [event('a'), event('b')]

    const { events, fresh } = mergeEvents(current, [event('b')], NOW)

    expect(events).toBe(current)
    expect(fresh).toEqual([])
  })

  it('leaves out what is older than the window, from `current` and `incoming` alike', () => {
    const stale = NOW - WINDOW_MS - 1
    const { events, fresh } = mergeEvents(
      [event('old', stale)],
      [event('older', stale), event('new')],
      NOW,
    )

    expect(ids(events)).toEqual(['new'])
    expect(ids(fresh)).toEqual(['new'])
  })
})

describe('prune', () => {
  it('keeps at most `MAX_EVENTS`, the newest', () => {
    const events = Array.from({ length: MAX_EVENTS + 2 }, (_, index) => event(`${index}`))

    const pruned = prune(events, NOW)

    expect(pruned).toHaveLength(MAX_EVENTS)
    expect(pruned[0].id).toBe('2')
  })

  it('returns `events` itself when nothing has to go', () => {
    const events = [event('a')]
    expect(prune(events, NOW)).toBe(events)
  })
})

describe('missesEvents', () => {
  const full = (from: number) =>
    Array.from({ length: RECENT_LIMIT }, (_, index) => event(`${from + index}`))

  it('is false when the answer has room: it holds the whole window', () => {
    expect(missesEvents([event('x')], [event('y')])).toBe(false)
  })

  it('is false when a full answer overlaps what is known', () => {
    expect(missesEvents([event('100')], full(100))).toBe(false)
  })

  it('is true when a full answer shares nothing with what is known', () => {
    expect(missesEvents([event('99')], full(100))).toBe(true)
    expect(missesEvents([], full(100))).toBe(true)
  })
})

describe('replayDelays', () => {
  it('spreads events as far apart as they came in, within the span', () => {
    const fresh = [event('a', 1_000), event('b', 1_400), event('c', 9_000)]
    expect(replayDelays(fresh, 2_500)).toEqual([0, 400, 2_500])
  })

  it('is empty for no event', () => {
    expect(replayDelays([], 2_500)).toEqual([])
  })
})

describe('windowUrl', () => {
  it('asks for the whole window, with the same URL for everyone', () => {
    expect(windowUrl('/mcp/live/events')).toBe('/mcp/live/events?window')
    expect(windowUrl('/docs/mcp/live/events?x=1')).toBe('/docs/mcp/live/events?x=1&window')
  })
})
