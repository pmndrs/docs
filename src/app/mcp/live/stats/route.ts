import { statsResponse } from './response'
import { getStatsStore } from './store'

// Never prerendered, and on Node, for the same reasons as `/mcp/live/events` (see
// `../events/route.ts`): the store is a Redis connection, or this instance's memory.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
// One pipelined Redis read: anything near this limit is a hung connection, not work
export const maxDuration = 10

/**
 * `GET /mcp/live/stats[?days=N]`: the MCP server's daily counters, as JSON -- see
 * `statsResponse`. Beside the page that reads it, and left out with it.
 */
export function GET(request: Request) {
  return statsResponse(getStatsStore(), new URL(request.url).searchParams)
}
