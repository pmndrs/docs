// The corpus `browse` and `search` read: one `llms-full.txt` per library, parsed into pages
// and cached on disk.
//
// One GET returns everything a library has -- 200 kB for drei -- so there is nothing finer
// to fetch and nothing to paginate. What is worth spending code on is not re-fetching it.

import { libs } from '@/libs'
import { homepage } from '@/package.json'
import * as cheerio from 'cheerio'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

/** A library whose site publishes a full-text dump, with an origin a plain fetch can use. */
export interface Lib {
  name: string
  title: string
  description: string
  /** Where the site is published, no trailing slash. */
  base: string
}

export interface Page {
  lib: Lib
  /** Path within the site, as the dump spells it, e.g. `/performances/instances`. */
  path: string
  title: string
  /** The page's own summary, when it has one. Absent on most. */
  description?: string
  /** The markdown body, preamble stripped. */
  body: string
}

/**
 * The libraries `browse` can read.
 *
 * `llms_full` is the whole filter -- a site not built with this generator 404s on that file.
 * Most sites live under a path of their own (`pmndrs.github.io/drei`), so the whole URL is the
 * base, not its origin. A relative entry is this site's own (`docs` points at one of its pages
 * rather than at a site), and that one is served from the homepage.
 */
export function readableLibs(): Lib[] {
  return Object.entries(libs)
    .filter(([, lib]) => 'llms_full' in lib && lib.llms_full)
    .map(([name, lib]) => ({
      name,
      title: lib.title,
      description: lib.description,
      base: lib.docs_url.startsWith('http') ? lib.docs_url.replace(/\/+$/, '') : homepage,
    }))
}

/** Read per call rather than once: a test points it somewhere disposable. */
function cacheDir() {
  return join(process.env.XDG_CACHE_HOME || join(homedir(), '.cache'), 'pmndrs-docs')
}

/** How long a dump is used without asking the network again. */
const TTL = 60 * 60 * 1000

export interface FetchOptions {
  /** Ignore a fresh cache entry and fetch again. */
  refresh?: boolean
}

/** The dump, from the cache when it is young enough, from the network otherwise. */
async function dump(lib: Lib, { refresh = false }: FetchOptions = {}): Promise<string> {
  const file = join(cacheDir(), `${lib.name}.txt`)

  const age = await stat(file).then(
    (stats) => Date.now() - stats.mtimeMs,
    () => undefined,
  )
  if (age !== undefined && !refresh && age < TTL) return readFile(file, 'utf8')

  const url = `${lib.base}/llms-full.txt`
  try {
    const response = await fetch(url, { redirect: 'follow' })
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
    const text = await response.text()

    await mkdir(cacheDir(), { recursive: true })
    await writeFile(file, text)
    return text
  } catch (error) {
    // A stale copy answers the question; a network error does not. Only say so when
    // there is nothing on disk to fall back to.
    if (age !== undefined) return readFile(file, 'utf8')
    throw new Error(`${lib.name}: cannot read ${url} (${(error as Error).message})`)
  }
}

/**
 * Each page carries a generated preamble -- its URL, then its description -- ahead of the
 * markdown. `webUrl` reconstructs the first, and the second is worth searching on its own,
 * so neither belongs in the body a reader renders.
 */
const PREAMBLE = /^URL:.*\n(?:Description:(.*)\n)?\n?/

function split(body: string) {
  const match = body.match(PREAMBLE)
  if (!match) return { body: body.trim() }
  return {
    description: match[1]?.trim() || undefined,
    body: body.slice(match[0].length).trim(),
  }
}

/**
 * The pages a dump holds.
 *
 * Parsed the way the MCP route parses the same file: the attributes are XML-escaped at
 * generation, so a regex would hand back `&amp;` in titles.
 */
export function parseDump(lib: Lib, text: string): Page[] {
  const $ = cheerio.load(text, { xmlMode: true })

  return $('page')
    .map((_, element) => {
      const page = $(element)
      return {
        lib,
        path: page.attr('path') ?? '',
        title: page.attr('title') || 'Untitled',
        ...split(page.text()),
      }
    })
    .get()
}

/** Every page of one library. */
export async function pagesOf(lib: Lib, options?: FetchOptions): Promise<Page[]> {
  return parseDump(lib, await dump(lib, options))
}

/** Every page of every readable library, in registry order. */
export async function corpus(options?: FetchOptions): Promise<Page[]> {
  const all = await Promise.all(readableLibs().map((lib) => pagesOf(lib, options)))
  return all.flat()
}

/** Where the page is published. */
export function webUrl(page: Page): string {
  return `${page.lib.base}${page.path}`
}
