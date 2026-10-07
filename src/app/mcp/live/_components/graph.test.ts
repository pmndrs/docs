import { describe, expect, it } from 'vitest'
import type { McpEvent } from './event'
import { buildGraph, linkId } from './graph'

let id = 0
function event(overrides: Partial<McpEvent> = {}): McpEvent {
  return {
    id: String(++id),
    ts: 0,
    client: 'claude-code',
    kind: 'tool',
    name: 'get_page_content',
    lib: 'drei',
    path: '/a',
    durationMs: 10,
    ok: true,
    ...overrides,
  }
}

const manifest = () => event({ kind: 'resource', name: 'docs://pmndrs/manifest', lib: undefined })

describe('buildGraph', () => {
  it('counts requests along client -> tool -> library', () => {
    const graph = buildGraph([event(), event(), event({ client: 'cursor' })])

    expect(graph.links).toContainEqual({
      id: linkId('client:claude-code', 'operation:get_page_content'),
      source: 'client:claude-code',
      target: 'operation:get_page_content',
      value: 2,
      count: 2,
      errors: 0,
    })
    expect(graph.links.find(({ target }) => target === 'lib:drei')?.count).toBe(3)
    expect(graph.nodes.find(({ id }) => id === 'lib:drei')).toMatchObject({
      column: 2,
      lib: 'drei',
    })
  })

  describe('columns, by selection size', () => {
    const events = [
      event({ lib: 'drei', path: '/a' }),
      event({ lib: 'zustand', path: '/b' }),
      event({ lib: 'uikit', path: '/c' }),
      event({ lib: 'xr', path: '/d' }),
      manifest(),
    ]

    it('ends the overview at the library when none is selected', () => {
      const graph = buildGraph(events)

      expect(graph.columns).toEqual(['Client', 'Tool / resource', 'Library'])
      expect(graph.nodes.some(({ id }) => id.startsWith('page:'))).toBe(false)
      expect(graph.route(manifest())).toHaveLength(2)
    })

    it('re-roots on a single library, with bare paths', () => {
      const graph = buildGraph(events, ['drei'])

      expect(graph.columns).toEqual(['Client', 'Tool / resource', 'Page (drei)'])
      expect(graph.route(events[0])).toEqual([
        'client:claude-code',
        'operation:get_page_content',
        'page:drei:/a',
      ])
      expect(graph.nodes.find(({ id }) => id === 'page:drei:/a')?.label).toBe('/a')
      expect(graph.route(events[1])).toEqual([])
    })

    it.each([[['drei', 'zustand']], [['drei', 'zustand', 'uikit']]])(
      'shows the pages of %j, and only theirs',
      (selection) => {
        const graph = buildGraph(events, selection)

        expect(graph.columns).toEqual(['Client', 'Tool / resource', 'Library', 'Page'])
        expect(graph.nodes.filter(({ lib }) => lib).map(({ lib }) => lib)).toEqual(selection)
        expect(graph.route(events[3])).toEqual([]) // xr
        expect(graph.route(manifest())).toEqual([])
      },
    )

    it('falls back to the overview past three libraries, still restricted to them', () => {
      const graph = buildGraph(events, ['drei', 'zustand', 'uikit', 'xr'])

      expect(graph.columns).toHaveLength(3)
      expect(graph.nodes.filter(({ lib }) => lib)).toHaveLength(4)
      expect(graph.route(manifest())).toEqual([])
    })
  })

  it('keeps the same path of two libraries apart, and says which is which', () => {
    const drei = event({ lib: 'drei', path: '/getting-started/installation' })
    const uikit = event({ lib: 'uikit', path: '/getting-started/installation' })
    const graph = buildGraph([drei, uikit], ['drei', 'uikit'])

    const pages = graph.nodes.filter(({ column }) => column === 3)
    expect(pages.map(({ id }) => id)).toEqual([
      'page:drei:/getting-started/installation',
      'page:uikit:/getting-started/installation',
    ])
    expect(pages.map(({ label }) => label)).toEqual([
      'drei · /getting-started/installation',
      'uikit · /getting-started/installation',
    ])
  })

  it('stops a request at the last column it has something for', () => {
    const index = event({ kind: 'resource', name: 'docs://{lib}/index', path: undefined })
    const graph = buildGraph([index], ['drei', 'zustand'])

    expect(graph.route(index)).toEqual([
      'client:claude-code',
      'operation:docs://{lib}/index',
      'lib:drei',
    ])
    expect(buildGraph([manifest()]).nodes.find(({ column }) => column === 1)?.label).toBe(
      'manifest',
    )
  })

  it('ends a failed call on an error page', () => {
    const failed = event({ path: undefined, ok: false })
    const graph = buildGraph([failed], ['drei'])

    expect(graph.route(failed).at(-1)).toBe('page:drei:(error)')
    expect(graph.links.every(({ errors }) => errors === 1)).toBe(true)
  })

  describe('overflow', () => {
    // One busy page, and a long tail of pages read once each
    const events = [
      ...Array.from({ length: 5 }, () => event({ path: '/busy' })),
      ...Array.from({ length: 40 }, (_, index) => event({ path: `/tail-${index}` })),
    ]

    it('folds the quietest nodes of a crowded column into one', () => {
      const graph = buildGraph(events, ['drei'], 4)

      const pages = graph.nodes.filter(({ column }) => column === 2)
      expect(pages).toHaveLength(4)
      expect(pages.find(({ overflow }) => overflow)).toMatchObject({
        id: 'other:2',
        label: '+38 other pages',
        overflow: 38,
      })
      expect(graph.route(events.at(-1)!).at(-1)).toBe('other:2')
    })

    it('keeps true counts, but never weighs the overflow above the busiest node', () => {
      const graph = buildGraph(events, ['drei'], 4)

      const into = graph.links.filter(({ target }) => target === 'other:2')
      expect(into.reduce((sum, { count }) => sum + count, 0)).toBe(38)
      expect(into.reduce((sum, { value }) => sum + value, 0)).toBeCloseTo(5)

      const busy = graph.links.find(({ target }) => target === 'page:drei:/busy')
      expect(busy).toMatchObject({ count: 5, value: 5 })
    })

    it('names what it folds, column by column', () => {
      const clients = Array.from({ length: 6 }, (_, index) => event({ client: `client-${index}` }))
      const graph = buildGraph(clients, [], 3)

      expect(graph.nodes.find(({ id }) => id === 'other:0')?.label).toBe('+4 other clients')
    })
  })
})
