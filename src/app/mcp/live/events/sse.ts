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
}: {
  bus: McpEventBus
  lastEventId?: string | null
  signal: AbortSignal
  heartbeatMs?: number
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

      let backlog = bus.recent()
      if (lastEventId) {
        const seen = backlog.findIndex(({ id }) => id === lastEventId)
        if (seen !== -1) backlog = backlog.slice(seen + 1)
      }

      send('retry: 3000\n\n')
      send(formatBacklog(backlog))

      const unsubscribe = bus.subscribe((event) => send(formatEvent(event)))
      const heartbeat = setInterval(() => send(': heartbeat\n\n'), heartbeatMs)

      const onAbort = () => {
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
        unsubscribe()
        signal.removeEventListener('abort', onAbort)
      }

      if (signal.aborted) onAbort()
      else signal.addEventListener('abort', onAbort)
    },

    cancel() {
      cleanup()
    },
  })
}
