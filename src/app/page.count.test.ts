import type { Lib } from '@/cli/browse.corpus'
import { expect, test } from 'vitest'
import { countedLibs, countPages } from './page.count'

function lib(name: string): Lib {
  return { name, title: name, description: '', base: `https://pmndrs.github.io/${name}` }
}

/** A dump holding `n` pages, the way the generator writes one. */
function dump(n: number) {
  const pages = Array.from(
    { length: n },
    (_, i) =>
      `<page path="/p${i}" title="Page &amp; ${i}"><![CDATA[URL: x\n\n# Page ${i}\n]]></page>`,
  )
  return `Title\n\nFull documentation content.\n\n${pages.join('\n')}\n`
}

test('adds up the pages of every dump, and counts the libraries they come from', () => {
  expect(
    countPages([
      { lib: lib('drei'), text: dump(3) },
      { lib: lib('zustand'), text: dump(2) },
    ]),
  ).toEqual({ pages: 5, libraries: 2 })
})

test('a dump with no page in it is not a library', () => {
  // e.g. a site answering its 404 with an HTML page and a 200
  expect(
    countPages([
      { lib: lib('drei'), text: dump(3) },
      { lib: lib('leva'), text: '<!doctype html><html><body>Not found</body></html>' },
    ]),
  ).toEqual({ pages: 3, libraries: 1 })
})

test('says nothing rather than "0 pages" when no dump could be read', () => {
  expect(countPages([])).toBeUndefined()
  expect(countPages([{ lib: lib('leva'), text: '' }])).toBeUndefined()
})

test('counts every site built with this generator, not only those MCP serves', () => {
  const names = countedLibs().map((lib) => lib.name)

  // `llms_full` is off for uikit, which still publishes a dump
  expect(names).toContain('uikit')
  // Not built with this generator
  expect(names).not.toContain('react-spring')
  // This site's own pages, served from its homepage
  expect(countedLibs().find((lib) => lib.name === 'docs')?.base).toBe('https://docs.pmnd.rs')
})
