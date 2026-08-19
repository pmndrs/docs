import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, test, vi } from 'vitest'
import { parseDump, pagesOf, readableLibs, webUrl, type Lib } from './browse.corpus'

const drei: Lib = {
  name: 'drei',
  title: 'Drei',
  description: 'Helpers and abstractions',
  base: 'https://pmndrs.github.io',
}

const dump = `Drei

Full documentation content.

<page path="/performances/instances" title="Instances"><![CDATA[URL: https://pmndrs.github.io/drei/performances/instances
Description: Draw thousands of meshes in one call

# Instances

Regular meshes are drawn one by one.
]]></page>
<page path="/staging/environment" title="Environment &amp; lighting"><![CDATA[URL: https://pmndrs.github.io/drei/staging/environment

# Environment
]]></page>
`

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.XDG_CACHE_HOME
})

/** A cache dir of its own, so one test's fetches cannot answer another's. */
async function isolate() {
  process.env.XDG_CACHE_HOME = await mkdtemp(join(tmpdir(), 'pmndrs-docs-cache-'))
}

function stubFetch(responses: Array<Response | Error>) {
  const fetch = vi.fn(async () => {
    const next = responses.shift()
    if (next instanceof Error) throw next
    if (!next) throw new Error('fetched more times than the test allows')
    return next
  })
  vi.stubGlobal('fetch', fetch)
  return fetch
}

const ok = () => new Response(dump, { status: 200 })

test('reads every library whose site publishes a dump, at an absolute origin', () => {
  const libs = readableLibs()

  expect(libs.length).toBeGreaterThan(0)
  for (const lib of libs) expect(lib.base).toMatch(/^https:\/\/[^\s]+$/)
  // A site under a path of its own keeps it -- the dump is not at the domain root
  expect(libs.find((lib) => lib.name === 'drei')?.base).toBe('https://pmndrs.github.io/drei')
  // `docs` points at one of its own pages rather than at a site
  expect(libs.find((lib) => lib.name === 'docs')?.base).toBe('https://docs.pmnd.rs')
})

test('parses a dump into pages, with the generated preamble split off', () => {
  const [instances, environment] = parseDump(drei, dump)

  expect(instances.path).toBe('/performances/instances')
  expect(instances.title).toBe('Instances')
  expect(instances.description).toBe('Draw thousands of meshes in one call')
  expect(instances.body).toBe('# Instances\n\nRegular meshes are drawn one by one.')

  // Attributes are XML-escaped at generation
  expect(environment.title).toBe('Environment & lighting')
  expect(environment.description).toBeUndefined()
  expect(environment.body).toBe('# Environment')
})

test('a page knows where it is published', () => {
  expect(webUrl(parseDump(drei, dump)[0])).toBe('https://pmndrs.github.io/performances/instances')
})

test('fetches a dump once, then reads it from the cache', async () => {
  await isolate()
  const fetch = stubFetch([ok()])

  expect(await pagesOf(drei)).toHaveLength(2)
  expect(await pagesOf(drei)).toHaveLength(2)
  expect(fetch).toHaveBeenCalledTimes(1)
})

test('--refresh asks again even when the cache is fresh', async () => {
  await isolate()
  const fetch = stubFetch([ok(), ok()])

  await pagesOf(drei)
  await pagesOf(drei, { refresh: true })
  expect(fetch).toHaveBeenCalledTimes(2)
})

test('answers from a stale cache when the network is down', async () => {
  await isolate()
  stubFetch([ok(), new Error('ENOTFOUND')])

  await pagesOf(drei)
  expect(await pagesOf(drei, { refresh: true })).toHaveLength(2)
})

test('says which file it could not read when there is no cache to fall back to', async () => {
  await isolate()
  stubFetch([new Response('nope', { status: 404, statusText: 'Not Found' })])

  await expect(pagesOf(drei)).rejects.toThrow(/drei.*llms-full\.txt.*404/)
})
