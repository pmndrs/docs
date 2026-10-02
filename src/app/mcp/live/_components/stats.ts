/**
 * The MCP server's daily counters, as `/mcp/live/stats` returns them -- shared by the server code
 * that keeps them (`../stats`) and the page that shows them. Left out of the npm package and of
 * the static export, with the rest of `/mcp/live`.
 *
 * A counter is a number per UTC day: nothing in it names a request, a page or a user. Where the
 * live view answers "what is it being asked right now", these answer "is it used at all, and did
 * that change" -- which the live view cannot, its window being minutes long, and the platform's
 * logs a day.
 */

/** How many days `/mcp/live/stats` returns unless asked otherwise. */
export const DEFAULT_DAYS = 30
/** The most it returns -- as far back as a day's counters are kept. */
export const MAX_DAYS = 400
/** The query parameter that asks for another number of days: `?days=7`. */
export const DAYS_PARAM = 'days'

export interface DailyStats {
  /** The UTC day, as `YYYY-MM-DD`. */
  date: string
  /**
   * MCP handshakes (`initialize` requests). A client sends one each time it opens the server --
   * at startup, typically -- whether or not it then asks anything: a connection is not a use.
   */
  connections: number
  /** Tool calls -- what a use of the server looks like. */
  calls: number
  /** Resource reads: an index, the manifest. */
  reads: number
  /** Tool calls that failed. */
  errors: number
  /** Connections by client name, as the client announced it. */
  clients: Record<string, number>
  /** Tool calls by tool name. */
  tools: Record<string, number>
  /** Tool calls by library, for the calls that named one. */
  libs: Record<string, number>
}

/** The body of a `/mcp/live/stats` response. */
export interface McpStatsPayload {
  /** One entry per day asked for, oldest first -- a day without any request counts zeros. */
  days: DailyStats[]
}
