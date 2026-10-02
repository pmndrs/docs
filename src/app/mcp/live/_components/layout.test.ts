import { describe, expect, it } from 'vitest'
import type { McpEvent } from './event'
import { buildGraph } from './graph'
import { HEADER_HEIGHT, heightFor, layoutGraph, NODE_PADDING, NODE_WIDTH } from './layout'

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

/** A window like the one /mcp/live?lib=drei came up empty on: few requests, of every shape. */
const events = [
  event({ client: 'cursor', path: '/abstractions/clone' }),
  event({ client: 'node', kind: 'resource', name: 'docs://{lib}/index', path: undefined }),
  event({ client: 'node', path: undefined, ok: false }),
  event({ lib: 'zustand', path: '/reference/apis/create' }),
  event({ lib: 'examples', name: 'get_example', path: 'caustics' }),
  ...Array.from({ length: 10 }, (_, index) => event({ path: `/page-${index}` })),
]

describe('layoutGraph', () => {
  it.each([[[]], [['drei']], [['drei', 'zustand']]])(
    'lays out every node of the %j view, in its column',
    (selection) => {
      const graph = buildGraph(events, selection)
      const width = 900
      const height = heightFor(graph)
      const { nodes, links, columnX } = layoutGraph(graph, width, height)

      expect(nodes).toHaveLength(graph.nodes.length)
      expect(links).toHaveLength(graph.links.length)
      for (const node of nodes) {
        expect(node.x0).toBe(columnX[node.column])
        expect(node.x1).toBe(node.x0! + NODE_WIDTH)
        expect(node.y0).toBeGreaterThanOrEqual(HEADER_HEIGHT)
        expect(node.y1).toBeLessThanOrEqual(height)
        expect(node.y1! - node.y0!).toBeGreaterThan(0)
        expect(node.labelWidth).toBeGreaterThan(0)
      }
      for (const link of links) {
        expect(Number.isFinite(link.width)).toBe(true)
        expect(Number.isFinite(link.y0)).toBe(true)
      }
    },
  )

  it('keeps the labels of a column at least a line apart', () => {
    const graph = buildGraph(events, ['drei', 'zustand'])
    const { nodes } = layoutGraph(graph, 900, heightFor(graph))

    for (let column = 0; column < graph.columns.length; column++) {
      const centres = nodes
        .filter((node) => node.column === column)
        .map((node) => (node.y0! + node.y1!) / 2)
        .sort((a, b) => a - b)
      for (let index = 1; index < centres.length; index++) {
        expect(centres[index] - centres[index - 1]).toBeGreaterThanOrEqual(NODE_PADDING)
      }
    }
  })

  it('keeps each label short of the next column', () => {
    const graph = buildGraph(events, ['drei', 'zustand'])
    const { nodes, columnX } = layoutGraph(graph, 640, heightFor(graph))

    for (const node of nodes) {
      const next = columnX[node.column + 1] ?? 640
      expect(node.x1! + node.labelWidth).toBeLessThanOrEqual(next)
    }
  })

  it('pins columns even when the last ones are empty', () => {
    const graph = buildGraph(
      [event({ kind: 'resource', name: 'docs://pmndrs/manifest', lib: undefined })],
      ['drei', 'zustand'],
    )
    const { nodes, columnX } = layoutGraph(graph, 900, 300)

    expect(columnX).toHaveLength(4)
    expect(nodes).toHaveLength(0) // a manifest read is about no library
    const index = buildGraph(
      [event({ kind: 'resource', name: 'docs://{lib}/index', path: undefined })],
      ['drei', 'zustand'],
    )
    const laid = layoutGraph(index, 900, 300)
    expect(laid.nodes.map(({ x0 }) => x0)).toEqual(laid.columnX.slice(0, 3))
  })

  it('puts the overflow node last in its column', () => {
    const tail = Array.from({ length: 30 }, (_, index) => event({ path: `/tail-${index}` }))
    const graph = buildGraph(
      [...tail, event({ path: '/busy' }), event({ path: '/busy' })],
      ['drei'],
      4,
    )
    const { nodes } = layoutGraph(graph, 900, heightFor(graph))

    const pages = nodes.filter(({ column }) => column === 2).sort((a, b) => a.y0! - b.y0!)
    expect(pages.at(-1)?.overflow).toBe(28)
    // and never taller than the busiest page
    const busiest = Math.max(...pages.filter(({ overflow }) => !overflow).map((n) => n.y1! - n.y0!))
    expect(pages.at(-1)!.y1! - pages.at(-1)!.y0!).toBeLessThanOrEqual(busiest + 0.001)
  })
})
