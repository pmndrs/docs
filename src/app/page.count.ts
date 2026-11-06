// How many documentation pages the pmndrs sites built with this generator serve, for the home
// page to say so. Counted from each site's `llms-full.txt`, one `<page>` per page.

import { parseDump, toLib, type Lib } from '@/cli/browse.corpus'
import { libs } from '@/libs'
import { REFRESH_SECONDS } from './page.count.time'

/** Past this, a site is left out of the count rather than holding the page up. */
const TIMEOUT_MS = 10_000

/** On every dump fetch the count makes: `revalidateTag` with it forces a recount. */
export const PAGE_COUNT_TAG = 'page-count'

/** A library's dump, as fetched: no `text` when the site did not answer with one. */
interface Dump {
  lib: Lib
  text?: string
}

/** One library's share of the count. */
interface LibCount {
  name: string
  title: string
  /** 0 when its dump could not be read, or had no page in it. */
  pages: number
}

/** What the home page says: so many pages, across so many libraries, counted at such a time. */
export interface PageCount {
  pages: number
  libraries: number
  /** Every counted library, the most pages first; those that could not be read last, at 0. */
  libs: LibCount[]
  /** When the dumps were read, as an ISO string. */
  countedAt: string
}

/**
 * The libraries whose site is built with this generator, hence publishes a dump.
 *
 * `pmndrs_docs` rather than `llms_full`: that one also gates what MCP serves, and some of
 * these sites publish a dump without being served there yet.
 */
export function countedLibs(): Lib[] {
  return Object.entries(libs)
    .filter(([, lib]) => 'pmndrs_docs' in lib && lib.pmndrs_docs)
    .map(([name, lib]) => toLib(name, lib))
}

/**
 * The total over the dumps that could be read, or `undefined` when none could -- the page then
 * says nothing rather than "0 pages".
 *
 * A dump with no page in it does not count as a library: a site answering its 404 with a 200
 * would otherwise be one.
 *
 * @param dumps The dump of every counted library, read or not.
 * @param countedAt When they were read.
 */
export function countPages(dumps: Dump[], countedAt: Date): PageCount | undefined {
  const counts = dumps
    .map(({ lib, text }) => ({
      name: lib.name,
      title: lib.title,
      pages: text ? parseDump(lib, text).length : 0,
    }))
    .sort((a, b) => b.pages - a.pages)
  const read = counts.filter((lib) => lib.pages > 0)
  if (read.length === 0) return undefined

  return {
    pages: read.reduce((sum, lib) => sum + lib.pages, 0),
    libraries: read.length,
    libs: counts,
    countedAt: countedAt.toISOString(),
  }
}

/** The dump of `lib`, without its text when the site does not answer with one in time. */
async function fetchDump(lib: Lib): Promise<Dump> {
  try {
    const response = await fetch(`${lib.base}/llms-full.txt`, {
      next: { revalidate: REFRESH_SECONDS, tags: [PAGE_COUNT_TAG] },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!response.ok) return { lib }
    return { lib, text: await response.text() }
  } catch {
    return { lib }
  }
}

/**
 * How many pages every counted library serves, fetched in parallel and cached for an hour. A
 * site that fails -- a 404, a timeout, no network at all -- counts for 0, never throws.
 */
export async function fetchPageCount(): Promise<PageCount | undefined> {
  const dumps = await Promise.all(countedLibs().map(fetchDump))
  return countPages(dumps, new Date())
}
