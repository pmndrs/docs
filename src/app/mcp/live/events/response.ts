import { RECENT_LIMIT, WINDOW_PARAM, type McpEventsPayload } from '@/app/mcp/live/_components/event'
import type { McpEventBus } from './bus'

/**
 * How `/mcp/live/events` is cached. The page polls it every few seconds, and the response is the
 * same for every viewer -- nothing in it depends on who asks -- so the CDN can answer them all:
 * - `Vercel-CDN-Cache-Control`: Vercel's CDN keeps a response 2 seconds, then serves it for up
 *   to 5 more while one request in the background fetches the next. The function then runs about
 *   once every 2 seconds per region, whatever the number of viewers. Vercel consumes this header:
 *   it never reaches the browser.
 * - `Cache-Control`: the browser keeps nothing, and asks again on every poll.
 */
export const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=0, must-revalidate',
  'Vercel-CDN-Cache-Control': 'max-age=2, stale-while-revalidate=5',
}

/**
 * The newest `RECENT_LIMIT` events of the window, oldest first -- or the whole window when
 * `searchParams` has `WINDOW_PARAM`. Nothing else in the request is read.
 */
export async function eventsResponse(bus: McpEventBus, searchParams: URLSearchParams) {
  const limit = searchParams.has(WINDOW_PARAM) ? undefined : RECENT_LIMIT
  const payload: McpEventsPayload = { events: await bus.recent(limit) }
  return Response.json(payload, { headers: CACHE_HEADERS })
}
