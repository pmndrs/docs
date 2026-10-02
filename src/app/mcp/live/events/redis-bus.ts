/**
 * The `McpEventBus` every server instance shares, on Redis -- what `getEventBus` returns when
 * `REDIS_URL` is set.
 *
 * Two keys, both named after `prefix`, so that the database can serve something else too -- the
 * other deployments' events, to begin with (see `getEventBus`):
 * - a list, the last `capacity` events, newest first -- what `recent` reads;
 * - a pub/sub channel, each event as it is published -- what `subscribe` listens to.
 *
 * An instance holds at most two connections (the database allows 30 in all): one for commands,
 * opened on first use, and one subscribed to the channel, opened for the first listener and closed
 * after the last. Redis being down must never fail an MCP request, nor crash the process: every
 * error is logged, and the call it broke publishes nothing, or reads an empty backlog.
 */

import { createClient, type RedisClientType } from 'redis'
import { WINDOW_MS, type McpEvent } from '@/app/mcp/live/_components/event'
import type { McpEventBus, McpEventListener } from './bus'

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
  /** Closes both connections -- for tests, which would otherwise not exit. */
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
  /** Namespaces the list and the channel. */
  prefix?: string
  now?: () => number
}): RedisEventBus {
  const key = `${prefix}:events`
  const channel = `${prefix}:events`

  function newClient(): RedisClientType {
    // Without an `error` listener, a lost connection would crash the process
    return createClient(connectionOptions(url)).on('error', logError)
  }

  //
  // Commands
  //

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

  //
  // Subscription
  //

  const listeners = new Set<McpEventListener>()
  let subscriber: RedisClientType | undefined

  function openSubscriber() {
    let client: RedisClientType
    try {
      client = newClient()
    } catch (error) {
      // A malformed `REDIS_URL`: the stream goes on without live events, as with Redis down
      logError(error)
      return
    }
    subscriber = client

    // node-redis subscribes again by itself after a reconnection; when it gives up instead, a new
    // connection takes over for the listeners still there
    client.on('terminated', () => {
      if (subscriber !== client) return
      subscriber = undefined
      if (listeners.size > 0) openSubscriber()
    })

    const onMessage = (message: string) => {
      // A connection being replaced must not deliver beside the one replacing it
      if (subscriber !== client) return

      let event: McpEvent
      try {
        event = JSON.parse(message) as McpEvent
      } catch (error) {
        logError(error)
        return
      }

      for (const listener of listeners) {
        // One broken subscriber, typically a stream whose client has just gone, must not keep
        // the event from the others
        try {
          listener(event)
        } catch (error) {
          console.error('MCP event listener failed:', error)
        }
      }
    }

    client
      .connect()
      .then(() => client.subscribe(channel, onMessage))
      .catch((error) => {
        // Closed on purpose while connecting, or already logged by the `error` listener
        if (subscriber === client) logError(error)
      })
  }

  function closeSubscriber() {
    const client = subscriber
    subscriber = undefined
    // Nothing is pending on a subscriber worth waiting for
    client?.destroy()
  }

  return {
    async publish(event) {
      // Pipelined rather than a MULTI, which would cost two more operations against the
      // database's rate limit
      try {
        const json = JSON.stringify(event)
        const client = await commandClient()
        await client
          .multi()
          .lPush(key, json)
          .lTrim(key, 0, capacity - 1)
          .publish(channel, json)
          .execAsPipeline()
      } catch (error) {
        logError(error)
      }
    },

    subscribe(listener) {
      listeners.add(listener)
      if (!subscriber) openSubscriber()

      return () => {
        listeners.delete(listener)
        // So that an instance nobody watches holds one connection, not two
        if (listeners.size === 0) closeSubscriber()
      }
    },

    async recent() {
      try {
        const client = await commandClient()
        const newestFirst = await client.lRange(key, 0, capacity - 1)
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
      listeners.clear()
      closeSubscriber()
      const client = commands?.client
      commands = undefined
      if (client?.isOpen) await client.close()
    },
  }
}
