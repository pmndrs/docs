'use client'

import { useEffect, useRef, useState } from 'react'
import type { McpEvent, McpEventsPayload } from './event'
import { mergeEvents, missesEvents, prune, replayDelays, windowUrl } from './merge'

/**
 * - `paused`: not polling, on purpose -- see `stream-gate.ts`;
 * - `connecting`, until the first answer, then `live`;
 * - `reconnecting`: a poll failed, and the next ones are retried, further and further apart;
 * - `offline`: `OFFLINE_AFTER` polls in a row failed -- still retried, and `live` again on the
 *   first that answers.
 */
export type StreamStatus = 'paused' | 'connecting' | 'live' | 'reconnecting' | 'offline'

/**
 * How often the page asks. The CDN keeps an answer 2 seconds (see `events/response.ts`): asking
 * more often would mostly get the same one back.
 */
const POLL_MS = 2_500
/** A poll that takes longer counts as failed. */
const TIMEOUT_MS = 10_000
const OFFLINE_AFTER = 3
const MAX_RETRY_MS = 30_000
/** How often the window slides, when nothing comes in. */
const PRUNE_MS = 5_000

function retryDelay(failures: number) {
  return Math.min(POLL_MS * 2 ** failures, MAX_RETRY_MS)
}

async function fetchEvents(url: string, signal: AbortSignal) {
  // The default cache mode: `no-store` or `reload` would add `Cache-Control: no-cache` to the
  // request. The response tells the browser to revalidate every time anyway.
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`${url} answered ${response.status}`)
  return ((await response.json()) as McpEventsPayload).events
}

/**
 * The events of the sliding window, polled from the `/mcp/live/events` endpoint at `url` every
 * `POLL_MS`, only while `enabled`.
 *
 * The first poll -- and the first after a pause -- reads the whole window; the next ones only its
 * newest events, unless events may have been missed in between (`missesEvents`). Events are
 * deduplicated by id and kept in order of time.
 *
 * `onLive` is called once per event that came in while polling -- spread out as they came in,
 * so a poll's worth arrives as it happened -- and not for a whole window, which only fills it.
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

  // What was last rendered, for each poll to merge into without waiting for a render
  const eventsRef = useRef<McpEvent[]>([])

  useEffect(() => {
    const commit = (next: McpEvent[]) => {
      if (next === eventsRef.current) return
      eventsRef.current = next
      setEvents(next)
    }

    if (!enabled) {
      if (openedRef.current) setStatus('paused')
      return
    }
    openedRef.current = true
    setStatus('connecting')

    let stopped = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let controller: AbortController | undefined
    const replays = new Set<ReturnType<typeof setTimeout>>()
    // Whether the next poll reads the whole window: the first one, and after a gap
    let wholeWindow = true
    let failures = 0

    const replay = (fresh: McpEvent[]) => {
      replayDelays(fresh, POLL_MS).forEach((delay, index) => {
        const replaying = setTimeout(() => {
          replays.delete(replaying)
          onLiveRef.current(fresh[index])
        }, delay)
        replays.add(replaying)
      })
    }

    const schedule = (delay: number) => {
      timer = setTimeout(poll, delay)
    }

    async function poll() {
      controller = new AbortController()
      const readsWindow = wholeWindow
      try {
        const incoming = await fetchEvents(
          readsWindow ? windowUrl(url) : url,
          AbortSignal.any([controller.signal, AbortSignal.timeout(TIMEOUT_MS)]),
        )
        if (stopped) return

        if (!readsWindow && missesEvents(eventsRef.current, incoming)) {
          wholeWindow = true
          schedule(0)
          return
        }

        const { events, fresh } = mergeEvents(eventsRef.current, incoming, Date.now())
        commit(events)
        if (!readsWindow) replay(fresh)

        wholeWindow = false
        failures = 0
        setStatus('live')
        schedule(POLL_MS)
      } catch {
        if (stopped) return
        failures++
        setStatus(failures >= OFFLINE_AFTER ? 'offline' : 'reconnecting')
        schedule(retryDelay(failures))
      }
    }
    void poll()

    return () => {
      stopped = true
      clearTimeout(timer)
      controller?.abort()
      replays.forEach(clearTimeout)
    }
  }, [url, enabled])

  // The window slides even when nothing comes in
  useEffect(() => {
    const interval = setInterval(() => {
      const pruned = prune(eventsRef.current, Date.now())
      if (pruned === eventsRef.current) return
      eventsRef.current = pruned
      setEvents(pruned)
    }, PRUNE_MS)
    return () => clearInterval(interval)
  }, [])

  return { events, status }
}
