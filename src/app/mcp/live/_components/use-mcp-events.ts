'use client'

import { useEffect, useRef, useState } from 'react'
import { WINDOW_MS, type McpEvent } from './event'

/** Past this, the oldest events go first, whatever their age. */
const MAX_EVENTS = 1000

/**
 * - `paused`: not connected, on purpose -- see `stream-gate.ts`;
 * - `connecting`, then `live`;
 * - `reconnecting`: the connection dropped, and the browser is retrying on its own;
 * - `offline`: it gave up -- the endpoint answered with an error, or is not allowed from here.
 */
export type StreamStatus = 'paused' | 'connecting' | 'live' | 'reconnecting' | 'offline'

function prune(events: McpEvent[], now: number) {
  const oldest = now - WINDOW_MS
  const kept = events.filter(({ ts }) => ts >= oldest)
  return kept.length > MAX_EVENTS ? kept.slice(-MAX_EVENTS) : kept
}

/** `url`, asking to resume after `lastEventId` -- what a browser sends as `Last-Event-ID` when it
 * reconnects on its own, but cannot when the connection is closed and opened again by hand. */
export function resumeUrl(url: string, lastEventId: string | undefined) {
  if (!lastEventId) return url
  return `${url}${url.includes('?') ? '&' : '?'}lastEventId=${encodeURIComponent(lastEventId)}`
}

/**
 * The events of the sliding window, from the `/mcp/live/events` stream at `url`, connected only
 * while `enabled`.
 *
 * `onLive` is called once per event published while connected -- not for a backlog, which only
 * fills the window. Events are deduplicated by id, so reconnecting never counts one twice, and a
 * reconnection resumes after the last event seen.
 */
export function useMcpEvents(url: string, enabled: boolean, onLive: (event: McpEvent) => void) {
  const [events, setEvents] = useState<McpEvent[]>([])
  // Not `paused` to begin with: the gate is closed on the first render only until it has looked
  const [status, setStatus] = useState<StreamStatus>('connecting')
  const openedRef = useRef(false)

  const onLiveRef = useRef(onLive)
  useEffect(() => {
    onLiveRef.current = onLive
  }, [onLive])

  // Across connections: what was seen, and the last id to resume from
  const seenRef = useRef(new Set<string>())
  const lastIdRef = useRef<string>(undefined)

  useEffect(() => {
    if (!enabled) {
      if (openedRef.current) setStatus('paused')
      return
    }
    openedRef.current = true

    setStatus('connecting')
    const source = new EventSource(resumeUrl(url, lastIdRef.current))
    const seen = seenRef.current

    const add = (incoming: McpEvent[]) => {
      const fresh = incoming.filter(({ id }) => !seen.has(id))
      fresh.forEach(({ id }) => seen.add(id))
      if (incoming.length > 0) lastIdRef.current = incoming[incoming.length - 1].id
      if (fresh.length > 0) {
        setEvents((events) => prune([...events, ...fresh], Date.now()))
      }
      return fresh
    }

    source.addEventListener('open', () => setStatus('live'))
    source.addEventListener('error', () => {
      setStatus(source.readyState === EventSource.CLOSED ? 'offline' : 'reconnecting')
    })
    source.addEventListener('backlog', (message) => {
      add(JSON.parse(message.data) as McpEvent[])
    })
    source.addEventListener('mcp', (message) => {
      add([JSON.parse(message.data) as McpEvent]).forEach((event) => onLiveRef.current(event))
    })

    return () => source.close()
  }, [url, enabled])

  // The window slides even when nothing comes in
  useEffect(() => {
    const interval = setInterval(() => {
      setEvents((events) => {
        const pruned = prune(events, Date.now())
        if (pruned.length === events.length) return events
        const kept = new Set(pruned.map(({ id }) => id))
        seenRef.current.forEach((id) => kept.has(id) || seenRef.current.delete(id))
        return pruned
      })
    }, 5_000)
    return () => clearInterval(interval)
  }, [])

  return { events, status }
}
