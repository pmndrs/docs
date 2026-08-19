// What a target on the command line points at.
//
// One grammar, two callers: `browse [target]` starts there, and `search --in <target>` narrows
// to it. A target that resolves to nothing is not an error -- it becomes the search query,
// which is the screen that can actually answer it.

import type { Lib, Page } from './browse.corpus'

export type Target =
  | { kind: 'lib'; lib: Lib }
  | { kind: 'page'; page: Page }
  | { kind: 'query'; query: string; lib?: Lib }

/** Trailing slashes are noise everywhere; a lone `/` is not a path either. */
function tidy(target: string) {
  return target.trim().replace(/\/+$/, '')
}

/**
 * Resolves `drei`, `drei/performances/instances`, `/performances/instances`, or anything else.
 *
 * A bare path with no library is accepted only when one page in the corpus has it -- that is
 * the shape the MCP index publishes, so an agent can paste a line from it straight in. When
 * two libraries share the path, it stays a query rather than picking one of them.
 */
export function resolveTarget(target: string, pages: Page[]): Target {
  const tidied = tidy(target)
  if (!tidied) return { kind: 'query', query: '' }

  const [head, ...rest] = tidied.split('/')
  const lib = pages.find((page) => page.lib.name.toLowerCase() === head.toLowerCase())?.lib

  if (lib) {
    if (rest.length === 0) return { kind: 'lib', lib }

    const path = `/${rest.join('/')}`
    const page = pages.find((page) => page.lib.name === lib.name && page.path === path)
    if (page) return { kind: 'page', page }

    // `drei/perf` is someone looking inside drei, not a library called `drei/perf`.
    return { kind: 'query', query: rest.join(' '), lib }
  }

  if (tidied.startsWith('/')) {
    const found = pages.filter((page) => page.path === tidied)
    if (found.length === 1) return { kind: 'page', page: found[0] }
  }

  return { kind: 'query', query: tidied }
}
