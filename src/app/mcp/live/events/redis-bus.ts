/**
 * The `McpEventBus` every server instance shares, on Redis -- what `getEventBus` returns when
 * `REDIS_URL` is set: a list named after `prefix` (so that the database could serve something
 * else too), holding the last `capacity` events, newest first.
 *
 * An instance holds at most one connection (the database allows 30 in all), opened on first use.
 * Redis being down must never fail an MCP request, nor crash the process: every error is logged,
 * and the call it broke publishes nothing, or reads an empty window.
 */

import { createClient, type RedisClientType } from 'redis'
import { WINDOW_MS, type McpEvent } from '@/app/mcp/live/_components/event'
import type { McpEventBus } from './bus'

function connectionOptions(url: string) {
  return {
    url,
    socket: {
      connectTimeout: 2_000,
      // A few quick retries, then the client gives up: the next call opens a new one
      reconnectStrategy: (retries: number) =>
        retries < 5 ? Math.min(100 * 2 ** retries, 1_000) : false,
    },
    // Fails a command at once while disconnected, rather than queueing it in memory
    disableOfflineQueue: true,
  }
}

function logError(error: unknown) {
  console.error('MCP events Redis error:', error)
}

export type RedisEventBus = McpEventBus & {
  /** Closes the connection -- for tests, which would otherwise not exit. */
  close(): Promise<void>
}

export function createRedisEventBus({
  url,
  capacity,
  maxAgeMs = WINDOW_MS,
  prefix = 'mcp-live',
  now = Date.now,
}: {
  url: string
  capacity: number
  maxAgeMs?: number
  /** Namespaces the list. */
  prefix?: string
  now?: () => number
}): RedisEventBus {
  const key = `${prefix}:events`

  function newClient(): RedisClientType {
    // Without an `error` listener, a lost connection would crash the process
    return createClient(connectionOptions(url)).on('error', logError)
  }

  let commands: { client: RedisClientType; connected: Promise<unknown> } | undefined

  async function commandClient() {
    // Not open: never connected yet, closed, or given up on reconnecting
    if (!commands?.client.isOpen) {
      const client = newClient()
      commands = { client, connected: client.connect() }
    }
    await commands.connected
    return commands.client
  }

  return {
    publish(event) {
      const json = JSON.stringify(event)
      // Not awaited: the MCP request that publishes does not wait for Redis. Pipelined rather than
      // a MULTI, which would cost two more operations against the database's rate limit.
      commandClient()
        .then((client) =>
          client
            .multi()
            .lPush(key, json)
            .lTrim(key, 0, capacity - 1)
            .execAsPipeline(),
        )
        .catch(logError)
    },

    async recent(limit = capacity) {
      try {
        const client = await commandClient()
        const newestFirst = await client.lRange(key, 0, Math.min(limit, capacity) - 1)
        const oldest = now() - maxAgeMs
        return newestFirst
          .reverse()
          .map((json) => JSON.parse(json) as McpEvent)
          .filter((event) => event.ts >= oldest)
      } catch (error) {
        logError(error)
        return []
      }
    },

    async close() {
      const client = commands?.client
      commands = undefined
      if (client?.isOpen) await client.close()
    },
  }
}
