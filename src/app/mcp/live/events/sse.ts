import type { McpEvent } from '@/app/mcp/live/_components/event'
import type { McpEventBus } from './bus'

/**
 * The bus as Server-Sent Events, for the `/mcp/live` page:
 * - `event: backlog`, once, with what the bus still holds -- a JSON array, oldest first;
 * - `event: mcp`, then, for each event as it is published -- one JSON object;
 * - a comment every `heartbeatMs`, so proxies do not close a quiet stream.
 *
 * Each event goes out with its `id`. A browser reconnecting sends the last one back as
 * `Last-Event-ID`, and its backlog then starts after it, when the bus still has it.
 *
 * After `closeAfterMs`, the stream ends on its own, so that it is not the platform that cuts it at
 * the function's `maxDuration` -- with a runtime error. The browser just reconnects, and resumes.
 */

const HEARTBEAT_MS = 15_000

export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
  // Nginx and the like would otherwise buffer the stream
  'X-Accel-Buffering': 'no',
}

function formatEvent(event: McpEvent) {
  return `id: ${event.id}\nevent: mcp\ndata: ${JSON.stringify(event)}\n\n`
}

function formatBacklog(events: McpEvent[]) {
  const last = events.at(-1)
  return `${last ? `id: ${last.id}\n` : ''}event: backlog\ndata: ${JSON.stringify(events)}\n\n`
}

export function createEventStream({
  bus,
  lastEventId,
  signal,
  heartbeatMs = HEARTBEAT_MS,
  closeAfterMs,
}: {
  bus: McpEventBus
  lastEventId?: string | null
  signal: AbortSignal
  heartbeatMs?: number
  closeAfterMs?: number
}): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  let cleanup = () => {}

  return new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false
      const send = (chunk: string) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(chunk))
        } catch {
          // The stream is gone without an abort having said so
          cleanup()
        }
      }

      // Subscribed before the backlog is read, so that nothing published meanwhile falls between
      // the two: held back until the backlog is out, then sent unless the backlog had it already.
      let heldBack: McpEvent[] | undefined = []
      const unsubscribe = bus.subscribe((event) => {
        if (heldBack) heldBack.push(event)
        else send(formatEvent(event))
      })
      const heartbeat = setInterval(() => send(': heartbeat\n\n'), heartbeatMs)
      const timeout =
        closeAfterMs === undefined ? undefined : setTimeout(() => close(), closeAfterMs)

      const close = () => {
        cleanup()
        try {
          controller.close()
        } catch {
          // Already closed or errored
        }
      }

      cleanup = () => {
        if (closed) return
        closed = true
        clearInterval(heartbeat)
        clearTimeout(timeout)
        unsubscribe()
        signal.removeEventListener('abort', close)
      }

      if (signal.aborted) close()
      else signal.addEventListener('abort', close)

      send('retry: 3000\n\n')

      const sendBacklog = async () => {
        const recent = await bus.recent().catch((error: unknown) => {
          console.error('Failed to read the MCP event backlog:', error)
          return []
        })
        // Aborted while reading: `cleanup` has already let go of everything
        if (closed) return

        let backlog = recent
        if (lastEventId) {
          const seen = backlog.findIndex(({ id }) => id === lastEventId)
          if (seen !== -1) backlog = backlog.slice(seen + 1)
        }
        send(formatBacklog(backlog))

        // What the browser has, from this backlog or an earlier stream
        const sent = new Set(recent.map(({ id }) => id))
        const held = heldBack ?? []
        heldBack = undefined
        for (const event of held) if (!sent.has(event.id)) send(formatEvent(event))
      }
      void sendBacklog()
    },

    cancel() {
      cleanup()
    },
  })
}
