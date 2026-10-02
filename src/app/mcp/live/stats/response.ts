import {
  DAYS_PARAM,
  DEFAULT_DAYS,
  MAX_DAYS,
  type McpStatsPayload,
} from '@/app/mcp/live/_components/stats'
import { lastDays, toDailyStats, type McpStatsStore } from './store'

/**
 * How `/mcp/live/stats` is cached: like `/mcp/live/events` (see `../events/response.ts`), but a
 * day's counters move slowly, so the CDN keeps an answer a minute, then serves it for up to
 * another while it fetches the next. The browser keeps nothing.
 */
export const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=0, must-revalidate',
  'Vercel-CDN-Cache-Control': 'max-age=60, stale-while-revalidate=60',
}

/** `?days=N`, clamped to `1..MAX_DAYS` -- `DEFAULT_DAYS` when absent or not a number. */
export function parseDays(searchParams: URLSearchParams): number {
  const days = Number.parseInt(searchParams.get(DAYS_PARAM) ?? '', 10)
  if (Number.isNaN(days)) return DEFAULT_DAYS
  return Math.min(MAX_DAYS, Math.max(1, days))
}

/**
 * The counters of the last `?days` UTC days, today's included, oldest first. Nothing else in the
 * request is read.
 */
export async function statsResponse(
  store: McpStatsStore,
  searchParams: URLSearchParams,
  now = Date.now(),
) {
  const days = lastDays(parseDays(searchParams), now)
  const hashes = await store.read(days)
  const payload: McpStatsPayload = {
    days: days.map((day, index) => toDailyStats(day, hashes[index])),
  }
  return Response.json(payload, { headers: CACHE_HEADERS })
}
