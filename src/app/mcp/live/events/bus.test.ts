import { describe, expect, it, vi } from 'vitest'
import type { McpEvent } from '@/app/mcp/live/_components/event'
import { createEventId, createMemoryEventBus, getEventBus } from './bus'

function event(overrides: Partial<McpEvent> = {}): McpEvent {
  const ts = overrides.ts ?? 1_000
  return {
    id: createEventId(ts),
    ts,
    client: 'test',
    kind: 'tool',
    name: 'get_page_content',
    lib: 'drei',
    path: '/getting-started/introduction',
    durationMs: 12,
    ok: true,
    ...overrides,
  }
}

describe('createMemoryEventBus', () => {
  it('returns what was published, oldest first', async () => {
    const bus = createMemoryEventBus({ now: () => 1_000 })
    const first = event({ path: '/a' })
    const second = event({ path: '/b' })

    bus.publish(first)
    bus.publish(second)

    expect(await bus.recent()).toEqual([first, second])
  })

  it('keeps only the last `capacity` events', async () => {
    const bus = createMemoryEventBus({ capacity: 3, now: () => 1_000 })
    const events = Array.from({ length: 5 }, (_, index) => event({ path: `/${index}` }))

    events.forEach((e) => bus.publish(e))

    expect((await bus.recent()).map(({ path }) => path)).toEqual(['/2', '/3', '/4'])
  })

  it('leaves out events older than `maxAgeMs`', async () => {
    let now = 0
    const bus = createMemoryEventBus({ maxAgeMs: 100, now: () => now })

    bus.publish(event({ ts: 0, path: '/old' }))
    bus.publish(event({ ts: 50, path: '/new' }))
    now = 120

    expect((await bus.recent()).map(({ path }) => path)).toEqual(['/new'])
  })

  it('delivers to subscribers until they unsubscribe', () => {
    const bus = createMemoryEventBus()
    const listener = vi.fn()

    const unsubscribe = bus.subscribe(listener)
    const delivered = event()
    bus.publish(delivered)
    unsubscribe()
    bus.publish(event())

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(delivered)
  })

  it('keeps delivering when one subscriber throws', () => {
    const bus = createMemoryEventBus()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const healthy = vi.fn()

    bus.subscribe(() => {
      throw new Error('gone')
    })
    bus.subscribe(healthy)

    expect(() => bus.publish(event())).not.toThrow()
    expect(healthy).toHaveBeenCalledTimes(1)
    error.mockRestore()
  })
})

describe('getEventBus', () => {
  it('is one bus per process, kept on globalThis', () => {
    expect(getEventBus()).toBe(getEventBus())
  })
})

describe('createEventId', () => {
  it('sorts by time, then by creation', () => {
    const ids = [createEventId(1_000), createEventId(1_000), createEventId(2_000)]
    expect([...ids].sort()).toEqual(ids)
    expect(new Set(ids).size).toBe(3)
  })
})
