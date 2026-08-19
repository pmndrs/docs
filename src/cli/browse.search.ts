// Ranked search over the corpus, for the `/` field of the reader and for the `search` verb.

import { matchSorter } from 'match-sorter'
import type { Page } from './browse.corpus'

/**
 * Where a term is allowed to match, and how much a match there is worth.
 *
 * The body is capped at `CONTAINS`: it is where nearly every term appears somewhere, so
 * without a ceiling a passing mention in a code sample outranks a page whose title *is* the
 * term. Nothing below `CONTAINS` is a match at all -- subsequence matching is what made the
 * prototype answer `scroll` with `subscribeWithSelector`.
 */
const options = {
  keys: [
    { key: 'title', threshold: matchSorter.rankings.CONTAINS },
    { key: 'path', threshold: matchSorter.rankings.CONTAINS },
    { key: 'lib.name', threshold: matchSorter.rankings.CONTAINS },
    { key: 'description', threshold: matchSorter.rankings.CONTAINS },
    {
      key: 'body',
      threshold: matchSorter.rankings.CONTAINS,
      maxRanking: matchSorter.rankings.CONTAINS,
    },
  ],
  threshold: matchSorter.rankings.CONTAINS,
}

/**
 * The pages matching every term of `query`, best first.
 *
 * Terms are applied last to first so that the leading word -- the one someone weights most,
 * and the one they type first -- is what the final order is by.
 */
export function search(query: string, pages: Page[]): Page[] {
  const terms = query.trim().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return pages

  return terms.reduceRight((subset, term) => matchSorter(subset, term, options), pages)
}

export interface Match {
  /** 1-based, so that it reads like an editor's gutter. */
  line: number
  text: string
}

/** The lines of one page containing every term, for a search narrowed to a single page. */
export function matchingLines(page: Page, query: string): Match[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []

  return page.body
    .split('\n')
    .map((text, index) => ({ line: index + 1, text: text.trim() }))
    .filter(({ text }) => {
      const haystack = text.toLowerCase()
      return terms.every((term) => haystack.includes(term))
    })
}
