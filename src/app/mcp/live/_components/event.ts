/**
 * One request to the MCP server, as `/mcp/live/events` returns it -- shared by the server code
 * that produces it (`../events`) and the page that draws it. Both are left out of the npm package
 * and of the static export.
 */

/** How far back the view looks: what the server's bus keeps, and what the page draws. */
export const WINDOW_MS = 15 * 60 * 1000

/** How many of the newest events `/mcp/live/events` returns, unless asked for the whole window. */
export const RECENT_LIMIT = 100

/**
 * The query parameter that asks `/mcp/live/events` for the whole window instead -- what the page
 * reads first, and again whenever it may have missed events. Valueless (`?window`), so that every
 * viewer asks for the same URL and the CDN serves them all one cached copy.
 */
export const WINDOW_PARAM = 'window'

export type McpEventKind = 'tool' | 'resource'

export interface McpEvent {
  /** Unique across instances, increasing with time. */
  id: string
  /** Epoch milliseconds, when the request started. */
  ts: number
  /** Short normalized name of the MCP client, e.g. "claude-code", "cursor", "node". */
  client: string
  kind: McpEventKind
  /** The tool name, or the resource URI with its library generalized away. */
  name: string
  /** Library the request was about, when it was about one. */
  lib?: string
  /** Page path, or example name, when the request named one and it resolved. */
  path?: string
  durationMs: number
  ok: boolean
}

/** The body of a `/mcp/live/events` response. */
export interface McpEventsPayload {
  /** Oldest first: the newest `RECENT_LIMIT` of the window, or all of it with `?window`. */
  events: McpEvent[]
}
