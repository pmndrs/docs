// How many documentation pages the pmndrs sites built with this generator serve, for the home
// page to say so. Counted from each site's `llms-full.txt`, one `<page>` per page.

import { parseDump, toLib, type Lib } from '@/cli/browse.corpus'
import { libs } from '@/libs'

/** Past this, a site is left out of the count rather than holding the page up. */
const TIMEOUT_MS = 5_000

/** A library's dump, as fetched. */
interface Dump {
  lib: Lib
  text: string
}

/** What the home page says: so many pages, across so many libraries. */
export interface PageCount {
  pages: number
  libraries: number
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
 * @param dumps The dumps that were fetched.
 */
export function countPages(dumps: Dump[]): PageCount | undefined {
  const counts = dumps.map(({ lib, text }) => parseDump(lib, text).length).filter((n) => n > 0)
  if (counts.length === 0) return undefined

  return {
    pages: counts.reduce((sum, n) => sum + n, 0),
    libraries: counts.length,
  }
}

/** The dump of `lib`, or `undefined` when the site does not answer with one in time. */
async function fetchDump(lib: Lib): Promise<Dump | undefined> {
  try {
    const response = await fetch(`${lib.base}/llms-full.txt`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!response.ok) return undefined
    return { lib, text: await response.text() }
  } catch {
    return undefined
  }
}

/**
 * How many pages every counted library serves, fetched in parallel and cached for an hour. A
 * site that fails -- a 404, a timeout, no network at all -- is skipped, never thrown.
 */
export async function fetchPageCount(): Promise<PageCount | undefined> {
  const dumps = await Promise.all(countedLibs().map(fetchDump))
  return countPages(dumps.filter((dump) => dump !== undefined))
}
