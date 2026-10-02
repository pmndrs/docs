import { createClient, type RedisClientType } from 'redis'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createRedisConnection, type RedisConnection } from '@/app/mcp/live/events/redis-client'
import { createRedisStatsStore } from './redis-store'
import { record, type McpStatsStore } from './store'

/**
 * Against a real Redis, so only when `REDIS_URL` is set -- the CI has none. Two stores on two
 * connections stand for two server instances; their keys are this run's own, and deleted
 * afterwards.
 */

const url = process.env.REDIS_URL ?? ''

const NOON = Date.UTC(2026, 9, 2, 12) // 2026-10-02T12:00:00Z
const DAY = '2026-10-02'
const TTL_SECONDS = 600

describe.skipIf(!url)('createRedisStatsStore', () => {
  const prefix = `mcp-stats-test:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

  // Created in `beforeAll`: the body of a skipped suite still runs, to collect its tests
  let admin: RedisClientType
  let connections: RedisConnection[]
  let a: McpStatsStore
  let b: McpStatsStore

  beforeAll(async () => {
    admin = createClient({ url })
    await admin.connect()
    connections = [createRedisConnection(url), createRedisConnection(url)]
    a = createRedisStatsStore({ connection: connections[0], prefix, ttlSeconds: TTL_SECONDS })
    b = createRedisStatsStore({ connection: connections[1], prefix, ttlSeconds: TTL_SECONDS })
  })

  afterAll(async () => {
    for (const connection of connections) await connection.close()
    const keys = await admin.keys(`${prefix}:*`)
    if (keys.length > 0) await admin.del(keys)
    await admin.close()
  })

  it('adds up what both instances count, and reads it back as numbers', async () => {
    await record(a, { kind: 'tool', name: 'get_page_content', lib: 'drei', ok: true }, NOON)
    await record(b, { kind: 'tool', name: 'get_page_content', lib: 'drei', ok: false }, NOON)
    await record(b, { kind: 'connection', client: 'cursor', version: '1.7.0' }, NOON)

    expect(await a.read([DAY])).toEqual([
      {
        calls: 2,
        'tool:get_page_content': 2,
        'lib:drei': 2,
        errors: 1,
        connections: 1,
        'client:cursor': 1,
        'clientVersion:cursor/1.7.0': 1,
      },
    ])
  })

  it('gives a day an expiry', async () => {
    const ttl = await admin.ttl(`${prefix}:${DAY}`)
    expect(ttl).toBeGreaterThan(0)
    expect(ttl).toBeLessThanOrEqual(TTL_SECONDS)
  })

  it('reads a day without counters as empty, in order', async () => {
    expect(await b.read(['2026-01-01', DAY])).toEqual([{}, expect.objectContaining({ calls: 2 })])
  })
})

describe('createRedisStatsStore, with Redis unreachable', () => {
  it('neither throws nor rejects, and reads as empty', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
    // Nothing listens on port 1: the connection is refused, then given up on
    const connection = createRedisConnection('redis://127.0.0.1:1')
    const store = createRedisStatsStore({ connection })

    await expect(store.increment(DAY, ['calls'])).resolves.toBeUndefined()
    await expect(store.read([DAY, DAY])).resolves.toEqual([{}, {}])
    expect(logged).toHaveBeenCalled()

    await connection.close()
    logged.mockRestore()
  }, 10_000)
})
