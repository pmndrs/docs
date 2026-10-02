import type { McpEvent } from './event'

/**
 * Which libraries the graph shows, and the shape that gives it:
 * - none selected, or more than `MAX_LIBS_WITH_PAGES`: an overview, client -> tool/resource ->
 *   library, restricted to the selected libraries if any -- the pages of every library at once
 *   would be one long tail;
 * - two or three: client -> tool/resource -> library -> page, restricted to those libraries;
 * - exactly one: re-rooted on it, client -> tool/resource -> page.
 *
 * A selection is a list of library names, in the order they were picked. In a URL it is one
 * comma-separated parameter, `?lib=drei,uikit` -- so `?lib=drei` reads as a selection of one.
 */

export type Selection = string[]

export type GraphMode =
  | { kind: 'overview' }
  | { kind: 'pages'; libs: string[] }
  | { kind: 'rooted'; lib: string }

/** Past this many libraries selected, their pages are not shown. */
const MAX_LIBS_WITH_PAGES = 3

export function graphMode(selection: Selection): GraphMode {
  if (selection.length === 1) return { kind: 'rooted', lib: selection[0] }
  if (selection.length === 0 || selection.length > MAX_LIBS_WITH_PAGES) return { kind: 'overview' }
  return { kind: 'pages', libs: selection }
}

/** Whether the event is part of the graph for this selection. */
export function isSelected(event: McpEvent, selection: Selection) {
  return selection.length === 0 || (event.lib !== undefined && selection.includes(event.lib))
}

export function toggleLib(selection: Selection, lib: string): Selection {
  return selection.includes(lib) ? selection.filter((name) => name !== lib) : [...selection, lib]
}

export function parseSelection(param: string | null | undefined): Selection {
  if (!param) return []
  const libs = param
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
  return [...new Set(libs)]
}

/** The URL parameter for a selection, or `undefined` for none. */
export function formatSelection(selection: Selection) {
  return selection.length > 0 ? selection.join(',') : undefined
}
