import { createClient, type RedisClientType } from 'redis'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { McpEvent } from '@/app/mcp/live/_components/event'
import { createEventId } from './bus'
import { createRedisEventBus, type RedisEventBus } from './redis-bus'

/**
 * Against a real Redis, so only when `REDIS_URL` is set -- the CI has none. Two buses stand for
 * two server instances; their keys are this run's own, and deleted afterwards.
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
  const channel = `${prefix}:events`

  // Created in `beforeAll`: the body of a skipped suite still runs, to collect its tests
  let admin: RedisClientType
  let a: RedisEventBus
  let b: RedisEventBus

  const subscribers = async () => (await admin.pubSubNumSub(channel))[channel]

  beforeAll(async () => {
    admin = createClient({ url })
    await admin.connect()
    a = createRedisEventBus({ url, capacity: 10, prefix })
    b = createRedisEventBus({ url, capacity: 10, prefix })
  })

  afterAll(async () => {
    await a.close()
    await b.close()
    await admin.del(key)
    await admin.close()
  })

  it('delivers what one instance publishes to another, and keeps it for its backlog', async () => {
    const received: McpEvent[] = []
    const unsubscribe = b.subscribe((e) => received.push(e))
    // Subscribing is asynchronous: publish only once Redis knows of it
    await until(async () => (await subscribers()) === 1)

    const published = event('drei')
    a.publish(published)

    await until(async () => received.length > 0)
    expect(received).toEqual([published])
    expect(await b.recent()).toEqual([published])

    unsubscribe()
  })

  it('returns the backlog oldest first, capped at `capacity`', async () => {
    const events = Array.from({ length: 12 }, (_, index) => event(`lib-${index}`))
    events.forEach((e) => a.publish(e))

    await until(async () => (await b.recent()).at(-1)?.id === events.at(-1)!.id)
    expect(await b.recent()).toEqual(events.slice(-10))
  })

  it('closes its subscriber connection once the last listener is gone', async () => {
    const first = b.subscribe(() => {})
    const second = b.subscribe(() => {})
    await until(async () => (await subscribers()) === 1)

    first()
    expect(await subscribers()).toBe(1)

    second()
    await until(async () => (await subscribers()) === 0)
  })
})
