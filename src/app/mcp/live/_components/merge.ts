import { RECENT_LIMIT, WINDOW_MS, WINDOW_PARAM, type McpEvent } from './event'

/**
 * How the page folds what each poll of `/mcp/live/events` returns into the events it holds --
 * pure, so that it can be tested without a browser.
 */

/** Past this, the oldest events go first, whatever their age. */
export const MAX_EVENTS = 1000

function byTime(a: McpEvent, b: McpEvent) {
  return a.ts - b.ts || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
}

/** `events` without those older than the window, nor beyond `MAX_EVENTS`: `events` itself when
 * nothing has to go, so that React has nothing to redraw. */
export function prune(events: McpEvent[], now: number) {
  const oldest = now - WINDOW_MS
  const kept = events.filter(({ ts }) => ts >= oldest)
  const capped = kept.length > MAX_EVENTS ? kept.slice(-MAX_EVENTS) : kept
  return capped.length === events.length ? events : capped
}

/**
 * `incoming` merged into `current`: deduplicated by id, in order of time (then of id), pruned to
 * the window. `fresh` is what `current` did not have yet, in the same order.
 *
 * `events` is `current` itself when nothing changed.
 */
export function mergeEvents(current: McpEvent[], incoming: McpEvent[], now: number) {
  const known = new Set(current.map(({ id }) => id))
  const fresh: McpEvent[] = []
  for (const event of incoming) {
    if (known.has(event.id)) continue
    known.add(event.id)
    fresh.push(event)
  }
  if (fresh.length === 0) return { events: prune(current, now), fresh }

  fresh.sort(byTime)
  const events = prune([...current, ...fresh].sort(byTime), now)
  const kept = new Set(events.map(({ id }) => id))
  return { events, fresh: fresh.filter(({ id }) => kept.has(id)) }
}

/**
 * Whether events may have come in between `current` and `recent`, the newest `RECENT_LIMIT` of
 * the window: `recent` is full, and none of it is already known -- so the window has to be read
 * whole. When `recent` has room, it holds the whole window; and when one of its events is known,
 * everything after that one is in it.
 */
export function missesEvents(current: McpEvent[], recent: McpEvent[]) {
  if (recent.length < RECENT_LIMIT) return false
  const known = new Set(current.map(({ id }) => id))
  return !recent.some(({ id }) => known.has(id))
}

/**
 * When to replay each of `fresh` (in order of time) after a poll, in milliseconds: as far apart as
 * they came in, within `spanMs` -- so that a poll's worth of requests shows up as it happened,
 * not all at once.
 */
export function replayDelays(fresh: McpEvent[], spanMs: number) {
  const first = fresh[0]?.ts ?? 0
  return fresh.map(({ ts }) => Math.min(Math.max(ts - first, 0), spanMs))
}

/** `url`, asking for the whole window: the same URL for every viewer, cached once. */
export function windowUrl(url: string) {
  return `${url}${url.includes('?') ? '&' : '?'}${WINDOW_PARAM}`
}
