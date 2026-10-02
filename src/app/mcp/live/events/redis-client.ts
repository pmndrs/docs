/**
 * One Redis connection per instance, opened on first use, shared by everything that writes to
 * Redis from a request: the event bus (`redis-bus.ts`) and the daily counters
 * (`../stats/redis-store.ts`). The database allows 30 connections in all, so a second one per
 * instance is a second one too many.
 *
 * Redis being down must never fail an MCP request, nor crash the process: a lost connection is
 * logged, retried a few times, then given up on -- and the next call opens a new one.
 */

import { createClient, type RedisClientType } from 'redis'

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

/**
 * The deployment the keys belong to -- "production", "preview", or "development" off Vercel. All
 * of them share one `REDIS_URL`: without this in every key, the requests of a preview or a local
 * server would show on docs.pmnd.rs/mcp/live, and the other way around.
 */
export const ENVIRONMENT = process.env.VERCEL_ENV || 'development'

export function logRedisError(error: unknown) {
  console.error('MCP live Redis error:', error)
}

export interface RedisConnection {
  /** The client, connected -- rejects when it could not be. */
  client(): Promise<RedisClientType>
  /** Closes the connection -- for tests, which would otherwise not exit. */
  close(): Promise<void>
}

export function createRedisConnection(url: string): RedisConnection {
  let current: { client: RedisClientType; connected: Promise<unknown> } | undefined

  return {
    async client() {
      // Not open: never connected yet, closed, or given up on reconnecting
      if (!current?.client.isOpen) {
        // Without an `error` listener, a lost connection would crash the process
        const client: RedisClientType = createClient(connectionOptions(url)).on(
          'error',
          logRedisError,
        )
        current = { client, connected: client.connect() }
      }
      await current.connected
      return current.client
    },

    async close() {
      const client = current?.client
      current = undefined
      if (client?.isOpen) await client.close()
    },
  }
}

// On `globalThis`, so that every route of an instance shares one connection -- and so that
// `next dev` keeps it when it reloads a module, rather than opening a new one beside the old.
const GLOBAL_KEY = Symbol.for('@pmndrs/docs/mcp-redis-connection')

type GlobalWithConnection = typeof globalThis & { [GLOBAL_KEY]?: RedisConnection }

/** The instance's connection to `REDIS_URL` -- `undefined` when it is not set. */
export function getRedisConnection(): RedisConnection | undefined {
  const url = process.env.REDIS_URL
  if (!url) return undefined
  const global = globalThis as GlobalWithConnection
  global[GLOBAL_KEY] ??= createRedisConnection(url)
  return global[GLOBAL_KEY]
}
