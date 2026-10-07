// What the `search_docs` tool answers with: the ranked pages, in a shape an agent acts on.
//
// The ranking itself is `search` in `src/cli/browse.search.ts`, shared with the CLI's `search`
// verb; this module only decides how many hits to show and what to say about each.

import type { Page } from '@/cli/browse.corpus'

/** How many hits a search answers with: enough to pick from, few enough to read in one go. */
export const MAX_HITS = 10

/** How long a hit's one-line summary may be. */
const EXCERPT_LENGTH = 160

/**
 * One line that says what the page is about: its own description when it has one, else the
 * first body line that mentions a term of the query, else the first line of prose. Headings,
 * fences and blank lines are skipped, since they say nothing on their own.
 */
export function excerpt(page: Page, query: string): string | undefined {
  if (page.description) return truncate(page.description)

  const lines = proseLines(page.body)
  if (lines.length === 0) return undefined

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const mention = lines.find((line) => {
    const haystack = line.toLowerCase()
    return terms.some((term) => haystack.includes(term))
  })
  return truncate(mention ?? lines[0])
}

/** The body's lines of prose: no blank lines, no headings, nothing inside a code fence. */
function proseLines(body: string): string[] {
  const lines: string[] = []
  let inFence = false
  for (const raw of body.split('\n')) {
    const line = raw.trim()
    if (line.startsWith('```')) {
      inFence = !inFence
      continue
    }
    if (inFence || !line || line.startsWith('#')) continue
    lines.push(line)
  }
  return lines
}

function truncate(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > EXCERPT_LENGTH ? `${flat.slice(0, EXCERPT_LENGTH - 1).trimEnd()}…` : flat
}

/**
 * The tool's text: the first `MAX_HITS` of `hits`, numbered, each with the `lib` and `path` to
 * hand to `get_page_content`, and that instruction spelled out at the end. An empty result is
 * a message too, not an error: there is nothing wrong with the call, only with the terms.
 */
export function formatSearchResults(query: string, lib: string | undefined, hits: Page[]): string {
  const scope = lib ? ` in ${lib}` : ''

  if (hits.length === 0) {
    return [
      `No page matches "${query}"${scope}.`,
      'Try fewer or more general terms (the name of a component, hook or option works best)' +
        (lib ? ', or search without the lib filter.' : '.'),
    ].join('\n')
  }

  const shown = hits.slice(0, MAX_HITS)
  const heading =
    hits.length > shown.length
      ? `Top ${shown.length} of ${hits.length} pages matching "${query}"${scope}, best first:`
      : `${shown.length} page${shown.length === 1 ? '' : 's'} matching "${query}"${scope}, best first:`

  const lines = shown.flatMap((hit, index) => {
    const summary = excerpt(hit, query)
    return [
      `${index + 1}. lib="${hit.lib.name}" path="${hit.path}" - ${hit.title}`,
      ...(summary ? [`   ${summary}`] : []),
    ]
  })

  return [
    heading,
    '',
    ...lines,
    '',
    'Next: call get_page_content(lib, path) with the lib and path of a hit above, verbatim, to read the page in full before answering.',
  ].join('\n')
}
