/**
 * Daily counters of what the MCP server is asked -- for the "last 30 days" of `/mcp/live`.
 *
 * One hash per UTC day, of fields such as `calls`, `tool:get_page_content` or `client:cursor`,
 * each a count. Two implementations of one `McpStatsStore` interface, as for the event bus:
 * - with `REDIS_URL` set, Redis hashes (`redis-store.ts`), which every server instance shares and
 *   which outlive it -- the point: the platform's logs are kept a day, the live window minutes;
 * - without it -- local development, tests -- this instance's memory.
 *
 * Counting is fire-and-forget (see `capture.ts`): a store never throws nor rejects, so that the
 * request being counted cannot fail for it.
 */

import { ENVIRONMENT, getRedisConnection } from '@/app/mcp/live/events/redis-client'
import type { DailyStats } from '@/app/mcp/live/_components/stats'
import { createRedisStatsStore } from './redis-store'

export interface McpStatsStore {
  /** Adds one to each of `fields` in `day`'s hash. Never throws, and never rejects. */
  increment(day: string, fields: string[]): Promise<void>
  /**
   * The hashes of `days`, one per day in the same order -- empty for a day with no counter.
   * Never throws: a backend that fails reads as no counters at all.
   */
  read(days: string[]): Promise<Record<string, number>[]>
}

/** What a request counts as. */
export type StatsHit =
  | { kind: 'connection'; client: string; version?: string }
  | { kind: 'tool'; name: string; lib?: string; ok: boolean }
  | { kind: 'resource' }

const DAY_MS = 24 * 60 * 60 * 1000

/** The UTC day `ts` falls on, as `YYYY-MM-DD`. */
export function dayOf(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10)
}

/** The last `count` UTC days up to and including today's, oldest first. */
export function lastDays(count: number, now = Date.now()): string[] {
  return Array.from({ length: count }, (_, index) => dayOf(now - (count - 1 - index) * DAY_MS))
}

/** The fields a hit adds one to. */
export function fieldsFor(hit: StatsHit): string[] {
  switch (hit.kind) {
    case 'connection':
      return [
        'connections',
        `client:${hit.client}`,
        ...(hit.version ? [`clientVersion:${hit.client}/${hit.version}`] : []),
      ]
    case 'tool':
      return [
        'calls',
        `tool:${hit.name}`,
        ...(hit.lib ? [`lib:${hit.lib}`] : []),
        ...(hit.ok ? [] : ['errors']),
      ]
    case 'resource':
      return ['reads']
  }
}

/** Counts `hit` on the day of `now`. Never rejects. */
export function record(store: McpStatsStore, hit: StatsHit, now = Date.now()): Promise<void> {
  return store.increment(dayOf(now), fieldsFor(hit))
}

/** A day's hash, as the page reads it. */
export function toDailyStats(date: string, hash: Record<string, number>): DailyStats {
  const day: DailyStats = {
    date,
    connections: hash.connections ?? 0,
    calls: hash.calls ?? 0,
    reads: hash.reads ?? 0,
    errors: hash.errors ?? 0,
    clients: {},
    tools: {},
    libs: {},
  }
  for (const [field, count] of Object.entries(hash)) {
    const separator = field.indexOf(':')
    if (separator < 0) continue
    const name = field.slice(separator + 1)
    switch (field.slice(0, separator)) {
      case 'client':
        day.clients[name] = count
        break
      case 'tool':
        day.tools[name] = count
        break
      case 'lib':
        day.libs[name] = count
        break
      // `clientVersion:` stays in the hash, for a query by hand
    }
  }
  return day
}

/** An in-memory store: this instance's counters, lost on a cold start. */
export function createMemoryStatsStore(): McpStatsStore {
  const days = new Map<string, Record<string, number>>()

  return {
    async increment(day, fields) {
      let hash = days.get(day)
      if (!hash) {
        hash = {}
        days.set(day, hash)
      }
      for (const field of fields) hash[field] = (hash[field] ?? 0) + 1
    },

    async read(requested) {
      return requested.map((day) => ({ ...days.get(day) }))
    },
  }
}

// On `globalThis`, for the same reasons as the event bus (see `bus.ts`)
const GLOBAL_KEY = Symbol.for('@pmndrs/docs/mcp-stats-store')

type GlobalWithStore = typeof globalThis & { [GLOBAL_KEY]?: McpStatsStore }

export function getStatsStore(): McpStatsStore {
  const global = globalThis as GlobalWithStore
  const connection = getRedisConnection()
  global[GLOBAL_KEY] ??= connection
    ? createRedisStatsStore({ connection, prefix: `mcp-stats:${ENVIRONMENT}` })
    : createMemoryStatsStore()
  return global[GLOBAL_KEY]
}
