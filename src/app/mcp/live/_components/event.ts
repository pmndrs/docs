/**
 * One request to the MCP server, as `/api/mcp-events` streams it -- shared by the server code that
 * produces it (`src/app/api/_mcp-events`) and the page that draws it. Both are left out of the
 * npm package and of the static export.
 */

export type McpEventKind = 'tool' | 'resource'

export interface McpEvent {
  /** Unique within an instance, increasing with time: what SSE resumes from. */
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
