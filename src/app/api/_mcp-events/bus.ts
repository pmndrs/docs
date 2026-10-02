/**
 * What the MCP server was asked, as a stream of small events -- for the `/mcp/live` page.
 *
 * There is no storage behind this deployment, so the only implementation keeps the last few
 * minutes in memory: each server instance sees the requests it served itself, and nothing
 * survives a cold start. That is a partial, best-effort view, and the page says so. A shared
 * backend (Redis pub/sub and a capped list, say) would replace `createMemoryEventBus` behind
 * the same `McpEventBus` interface, in this one file.
 *
 * Server-only, and kept under `src/app/api` so it leaves the static export and the npm package
 * along with the routes that use it.
 *
 * An event carries identifiers only: never an IP, a header, or an argument beyond the library,
 * the page path and the example name -- see `capture.ts`, which builds them.
 */

import type { McpEvent } from '@/app/mcp/live/_components/event'

export type { McpEvent, McpEventKind } from '@/app/mcp/live/_components/event'

export interface McpEventFilter {
  /** Only the events about one of these libraries -- all of them when empty or left out. */
  libs?: string[]
}

export type McpEventListener = (event: McpEvent) => void

export interface McpEventBus {
  publish(event: McpEvent): void
  /** Returns the function that unsubscribes. */
  subscribe(listener: McpEventListener): () => void
  /** The events still in the window, oldest first. */
  recent(filter?: McpEventFilter): McpEvent[]
}

export function matchesFilter(event: McpEvent, filter: McpEventFilter = {}) {
  const { libs } = filter
  if (libs && libs.length > 0 && (event.lib === undefined || !libs.includes(event.lib))) {
    return false
  }
  return true
}

export const DEFAULT_CAPACITY = 500
export const DEFAULT_MAX_AGE_MS = 15 * 60 * 1000

/**
 * An in-memory bus: a ring buffer of the last `capacity` events, of which `recent` returns those
 * younger than `maxAgeMs`.
 */
export function createMemoryEventBus({
  capacity = DEFAULT_CAPACITY,
  maxAgeMs = DEFAULT_MAX_AGE_MS,
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
  const listeners = new Set<McpEventListener>()

  return {
    publish(event) {
      buffer[next] = event
      next = (next + 1) % capacity

      for (const listener of listeners) {
        // One broken subscriber, typically a stream whose client has just gone, must not keep
        // the event from the others -- nor fail the MCP request that published it.
        try {
          listener(event)
        } catch (error) {
          console.error('MCP event listener failed:', error)
        }
      }
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },

    recent(filter) {
      const oldest = now() - maxAgeMs
      const events: McpEvent[] = []
      for (let offset = 0; offset < capacity; offset++) {
        const event = buffer[(next + offset) % capacity]
        if (event && event.ts >= oldest && matchesFilter(event, filter)) events.push(event)
      }
      return events
    },
  }
}

// On `globalThis`, so that every route of an instance shares one bus -- and so that `next dev`
// keeps it when it reloads a module, rather than starting an empty one beside the old.
const GLOBAL_KEY = Symbol.for('@pmndrs/docs/mcp-event-bus')

type GlobalWithBus = typeof globalThis & { [GLOBAL_KEY]?: McpEventBus }

export function getEventBus(): McpEventBus {
  const global = globalThis as GlobalWithBus
  global[GLOBAL_KEY] ??= createMemoryEventBus()
  return global[GLOBAL_KEY]
}

let counter = 0

/** An id that sorts by time, then by order of creation within the instance. */
export function createEventId(ts: number) {
  counter = (counter + 1) % 1_000_000
  return `${ts.toString(36).padStart(9, '0')}-${counter.toString(36).padStart(4, '0')}`
}
