/**
 * The `McpEventBus` every server instance shares, on Redis -- what `getEventBus` returns when
 * `REDIS_URL` is set: a list named after `prefix` (so that the database can serve something else
 * too -- the other deployments' events, to begin with, see `getEventBus`), holding the last
 * `capacity` events, newest first.
 *
 * It writes through the instance's one connection (`redis-client.ts`). Redis being down must
 * never fail an MCP request: every error is logged, and the call it broke publishes nothing, or
 * reads an empty window.
 */

import { WINDOW_MS, type McpEvent } from '@/app/mcp/live/_components/event'
import type { McpEventBus } from './bus'
import { logRedisError, type RedisConnection } from './redis-client'

export function createRedisEventBus({
  connection,
  capacity,
  maxAgeMs = WINDOW_MS,
  prefix = 'mcp-live',
  now = Date.now,
}: {
  connection: RedisConnection
  capacity: number
  maxAgeMs?: number
  /** Namespaces the list. */
  prefix?: string
  now?: () => number
}): McpEventBus {
  const key = `${prefix}:events`

  return {
    async publish(event) {
      // Pipelined rather than a MULTI, which would cost two more operations against the
      // database's rate limit
      try {
        const json = JSON.stringify(event)
        const client = await connection.client()
        await client
          .multi()
          .lPush(key, json)
          .lTrim(key, 0, capacity - 1)
          .execAsPipeline()
      } catch (error) {
        logRedisError(error)
      }
    },

    async recent(limit = capacity) {
      try {
        const client = await connection.client()
        const newestFirst = await client.lRange(key, 0, Math.min(limit, capacity) - 1)
        const oldest = now() - maxAgeMs
        return newestFirst
          .reverse()
          .map((json) => JSON.parse(json) as McpEvent)
          .filter((event) => event.ts >= oldest)
      } catch (error) {
        logRedisError(error)
        return []
      }
    },
  }
}
