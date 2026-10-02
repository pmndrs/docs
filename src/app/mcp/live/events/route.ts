import { getEventBus } from './bus'
import { createEventStream, SSE_HEADERS } from './sse'

// A stream, per request: never prerendered, never cached. And Node, not Edge -- the bus lives in
// this instance's memory, which only the MCP route (a Node function) writes to.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * `GET /mcp/live/events[?lastEventId=...]`: the MCP requests this instance serves, as Server-Sent
 * Events -- see `createEventStream`. Beside the page that reads it, and left out with it.
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const stream = createEventStream({
    bus: getEventBus(),
    // The header when the browser reconnects on its own; the parameter when the page closed the
    // stream and opens it again (`/mcp/live` does, off screen), which cannot set headers
    lastEventId: request.headers.get('last-event-id') ?? searchParams.get('lastEventId'),
    signal: request.signal,
  })

  return new Response(stream, { headers: SSE_HEADERS })
}
