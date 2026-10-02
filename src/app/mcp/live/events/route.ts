import { getEventBus } from './bus'
import { eventsResponse } from './response'

// Never prerendered: a build would otherwise freeze the empty window it saw. Caching is left to
// the CDN, through the headers `eventsResponse` sets -- Next passes them through as they are on a
// dynamic route. And Node, not Edge: the bus is a Redis connection, or this instance's memory,
// which only the MCP route (a Node function) writes to.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
// One Redis read: anything near this limit is a hung connection, not work
export const maxDuration = 10

/**
 * `GET /mcp/live/events[?window]`: the MCP requests the server served lately, as JSON -- see
 * `eventsResponse`. Beside the page that polls it, and left out with it.
 */
export function GET(request: Request) {
  return eventsResponse(getEventBus(), new URL(request.url).searchParams)
}
