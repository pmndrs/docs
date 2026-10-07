/**
 * What the MCP server was asked, as a list of small events -- for the `/mcp/live` page.
 *
 * Two implementations of one `McpEventBus` interface:
 * - with `REDIS_URL` set, a capped Redis list (`redis-bus.ts`), which every server instance
 *   shares: a viewer sees the requests whichever instance served them;
 * - without it -- local development, tests -- an in-memory ring buffer, which only sees the
 *   requests its own instance served, and loses them on a cold start.
 *
 * Server-only, and kept under `src/app/mcp/live` so it leaves the static export and the npm
 * package along with the page and the route that use it.
 *
 * An event carries identifiers only: never an IP, a header, or an argument beyond the library,
 * the page path and the example name -- see `capture.ts`, which builds them.
 */

import { WINDOW_MS, type McpEvent } from '@/app/mcp/live/_components/event'
import { createRedisEventBus } from './redis-bus'

export interface McpEventBus {
  /**
   * Never throws, and never rejects: an MCP request is what calls it. The promise settles once
   * the event is stored -- the caller need not wait for it, but must keep the instance alive
   * until then (see `capture.ts`).
   */
  publish(event: McpEvent): Promise<void>
  /**
   * The events still in the window, oldest first -- only the newest `limit` of them when given.
   * Never throws: a backend that fails reads as an empty window.
   */
  recent(limit?: number): Promise<McpEvent[]>
}

const DEFAULT_CAPACITY = 500

/**
 * An in-memory bus: a ring buffer of the last `capacity` events, of which `recent` returns those
 * younger than `maxAgeMs`.
 */
export function createMemoryEventBus({
  capacity = DEFAULT_CAPACITY,
  maxAgeMs = WINDOW_MS,
  now = Date.now,
}: {
  capacity?: number
  maxAgeMs?: number
  now?: () => number
} = {}): McpEventBus {
  // `buffer[next]` is the slot the next event overwrites, which -- once the buffer is full --
  // is also the oldest one.
  const buffer: (McpEvent | undefined)[] = new Array(capacity)
  let next = 0

  return {
    async publish(event) {
      buffer[next] = event
      next = (next + 1) % capacity
    },

    async recent(limit = capacity) {
      const oldest = now() - maxAgeMs
      const events: McpEvent[] = []
      for (let offset = 0; offset < capacity; offset++) {
        const event = buffer[(next + offset) % capacity]
        if (event && event.ts >= oldest) events.push(event)
      }
      return events.slice(-limit)
    },
  }
}

/**
 * The deployment the events come from -- "production", "preview", or "development" off Vercel. All
 * of them share one `REDIS_URL`: without this in the key, the requests of a preview or a local
 * server would show on docs.pmnd.rs/mcp/live, and the other way around.
 */
const ENVIRONMENT = process.env.VERCEL_ENV || 'development'

// On `globalThis`, so that every route of an instance shares one bus -- and so that `next dev`
// keeps it when it reloads a module, rather than starting an empty one (or opening a new Redis
// connection) beside the old.
const GLOBAL_KEY = Symbol.for('@pmndrs/docs/mcp-event-bus')

type GlobalWithBus = typeof globalThis & { [GLOBAL_KEY]?: McpEventBus }

export function getEventBus(): McpEventBus {
  const global = globalThis as GlobalWithBus
  const url = process.env.REDIS_URL
  global[GLOBAL_KEY] ??= url
    ? createRedisEventBus({ url, capacity: DEFAULT_CAPACITY, prefix: `mcp-live:${ENVIRONMENT}` })
    : createMemoryEventBus()
  return global[GLOBAL_KEY]
}

let counter = 0

// Tells apart the ids two instances create in the same millisecond, now that they share a bus
const INSTANCE = Math.random().toString(36).slice(2, 8).padEnd(6, '0')

/** An id that sorts by time, then by order of creation within the instance. */
export function createEventId(ts: number) {
  counter = (counter + 1) % 1_000_000
  return `${ts.toString(36).padStart(9, '0')}-${counter.toString(36).padStart(4, '0')}-${INSTANCE}`
}
