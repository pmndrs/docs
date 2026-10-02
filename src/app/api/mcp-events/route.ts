import { getEventBus } from '../_mcp-events/bus'
import { createEventStream, SSE_HEADERS } from '../_mcp-events/sse'

// A stream, per request: never prerendered, never cached. And Node, not Edge -- the bus lives in
// this instance's memory, which only the MCP route (a Node function) writes to.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * `GET /api/mcp-events[?lib=drei,uikit][&lastEventId=...]`: the MCP requests this instance serves, as
 * Server-Sent Events -- see `createEventStream`. A static segment, so it wins over `[transport]`
 * beside it.
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  // One library or several, comma-separated: `?lib=drei` or `?lib=drei,uikit`
  const libs = (searchParams.get('lib') ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)

  const stream = createEventStream({
    bus: getEventBus(),
    filter: { libs },
    // The header when the browser reconnects on its own; the parameter when the page closed the
    // stream and opens it again (`/mcp/live` does, off screen), which cannot set headers
    lastEventId: request.headers.get('last-event-id') ?? searchParams.get('lastEventId'),
    signal: request.signal,
  })

  return new Response(stream, { headers: SSE_HEADERS })
}
