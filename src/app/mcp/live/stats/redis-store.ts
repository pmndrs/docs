/**
 * The `McpStatsStore` every server instance shares, on Redis -- what `getStatsStore` returns
 * when `REDIS_URL` is set: one hash per UTC day, `${prefix}:${YYYY-MM-DD}`, that every write
 * refreshes to live `TTL_SECONDS` more. Through the instance's one connection
 * (`../events/redis-client.ts`); every error is logged, and the call it broke counts nothing,
 * or reads no counters.
 */

import { logRedisError, type RedisConnection } from '@/app/mcp/live/events/redis-client'
import { MAX_DAYS } from '@/app/mcp/live/_components/stats'
import type { McpStatsStore } from './store'

/** How long a day's hash is kept: as far back as `/mcp/live/stats` can be asked for. */
export const TTL_SECONDS = MAX_DAYS * 24 * 60 * 60

/** An HGETALL reply -- an object, or a Map under RESP3 -- as numbers; anything else as empty. */
function toCounts(reply: unknown): Record<string, number> {
  const entries =
    reply instanceof Map
      ? [...reply.entries()]
      : typeof reply === 'object' && reply !== null
        ? Object.entries(reply)
        : []
  return Object.fromEntries(entries.map(([field, count]) => [String(field), Number(count)]))
}

export function createRedisStatsStore({
  connection,
  prefix = 'mcp-stats',
  ttlSeconds = TTL_SECONDS,
}: {
  connection: RedisConnection
  /** Namespaces the hashes. */
  prefix?: string
  ttlSeconds?: number
}): McpStatsStore {
  const keyOf = (day: string) => `${prefix}:${day}`

  return {
    async increment(day, fields) {
      // One pipeline: the increments, then the expiry -- set again on every write rather than
      // checked for, which would cost a round trip to save none
      try {
        const client = await connection.client()
        const key = keyOf(day)
        const pipeline = client.multi()
        for (const field of fields) pipeline.hIncrBy(key, field, 1)
        pipeline.expire(key, ttlSeconds)
        await pipeline.execAsPipeline()
      } catch (error) {
        logRedisError(error)
      }
    },

    async read(days) {
      try {
        const client = await connection.client()
        const pipeline = client.multi()
        for (const day of days) pipeline.hGetAll(keyOf(day))
        const hashes = await pipeline.execAsPipeline()
        return hashes.map(toCounts)
      } catch (error) {
        logRedisError(error)
        return days.map(() => ({}))
      }
    },
  }
}
