import { createClient, type RedisClientType } from 'redis'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { McpEvent } from '@/app/mcp/live/_components/event'
import type { McpEventBus } from './bus'
import { createEventId } from './bus'
import { createRedisEventBus } from './redis-bus'
import { createRedisConnection, type RedisConnection } from './redis-client'

/**
 * Against a real Redis, so only when `REDIS_URL` is set -- the CI has none. Two buses on two
 * connections stand for two server instances; their keys are this run's own, and deleted
 * afterwards.
 */

const url = process.env.REDIS_URL ?? ''

function event(lib: string): McpEvent {
  const ts = Date.now()
  return {
    id: createEventId(ts),
    ts,
    client: 'test',
    kind: 'tool',
    name: 'get_page_content',
    lib,
    durationMs: 1,
    ok: true,
  }
}

/** Polls `check` until it holds, for up to five seconds. */
async function until(check: () => Promise<boolean>) {
  const deadline = Date.now() + 5_000
  while (!(await check())) {
    if (Date.now() > deadline) throw new Error('Timed out')
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}

describe.skipIf(!url)('createRedisEventBus', () => {
  const prefix = `mcp-live-test:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  const key = `${prefix}:events`

  // Created in `beforeAll`: the body of a skipped suite still runs, to collect its tests
  let admin: RedisClientType
  let connections: RedisConnection[]
  let a: McpEventBus
  let b: McpEventBus

  beforeAll(async () => {
    admin = createClient({ url })
    await admin.connect()
    connections = [createRedisConnection(url), createRedisConnection(url)]
    a = createRedisEventBus({ connection: connections[0], capacity: 10, prefix })
    b = createRedisEventBus({ connection: connections[1], capacity: 10, prefix })
  })

  afterAll(async () => {
    for (const connection of connections) await connection.close()
    await admin.del(key)
    await admin.close()
  })

  it('returns to one instance what another published', async () => {
    const published = event('drei')
    a.publish(published)

    await until(async () => (await b.recent()).length > 0)
    expect(await b.recent()).toEqual([published])
  })

  it('resolves `publish` once the event is stored', async () => {
    const stored = event('zustand')
    await a.publish(stored)
    expect((await b.recent()).at(-1)).toEqual(stored)
  })

  it('returns the window oldest first, capped at `capacity`', async () => {
    const events = Array.from({ length: 12 }, (_, index) => event(`lib-${index}`))
    events.forEach((e) => a.publish(e))

    await until(async () => (await b.recent()).at(-1)?.id === events.at(-1)!.id)
    expect(await b.recent()).toEqual(events.slice(-10))
  })

  it('returns only the newest `limit` events when asked', async () => {
    const events = Array.from({ length: 4 }, (_, index) => event(`limited-${index}`))
    events.forEach((e) => a.publish(e))

    await until(async () => (await b.recent(1)).at(-1)?.id === events.at(-1)!.id)
    expect(await b.recent(2)).toEqual(events.slice(-2))
  })
})

describe('createRedisEventBus, with Redis unreachable', () => {
  it('neither throws nor rejects on `publish`', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
    // Nothing listens on port 1: the connection is refused, then given up on
    const connection = createRedisConnection('redis://127.0.0.1:1')
    const bus = createRedisEventBus({ connection, capacity: 10 })

    await expect(bus.publish(event('drei'))).resolves.toBeUndefined()
    expect(logged).toHaveBeenCalled()

    await connection.close()
    logged.mockRestore()
  }, 10_000)
})
