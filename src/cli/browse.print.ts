// What the reader looks like when nothing is watching: one result per line, on stdout.
//
// This is the half an agent or a pipe can use, and it is why `search` is a verb of its own
// rather than a key inside the reader -- neither can drive a full screen.

import type { Page } from './browse.corpus'
import type { Match } from './browse.search'

/**
 * Search results, in the shape the MCP server publishes its index in -- `{path} - {title}`,
 * behind the library that owns the page. Anything already reading that index reads this.
 */
export function formatHits(hits: Page[]): string {
  const width = Math.max(0, ...hits.map((hit) => hit.lib.name.length))
  return hits.map((hit) => `${hit.lib.name.padEnd(width)} ${hit.path} - ${hit.title}`).join('\n')
}

/** Matching lines within a single page, numbered the way an editor numbers them. */
export function formatMatches(matches: Match[]): string {
  const width = Math.max(0, ...matches.map((match) => String(match.line).length))
  return matches.map((match) => `${String(match.line).padStart(width)}: ${match.text}`).join('\n')
}
