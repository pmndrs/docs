import type { McpEvent } from './event'
import { graphMode, isSelected, type GraphMode, type Selection } from './selection'

/**
 * The events of the window as a Sankey graph, with fixed columns -- which ones depends on the
 * selection, see `selection.ts`:
 * - overview: client -> tool/resource -> library;
 * - pages of two or three libraries: client -> tool/resource -> library -> page;
 * - re-rooted on one library: client -> tool/resource -> page.
 *
 * A request stops at the last column it has something for: a manifest read names no library, an
 * index read no page. A call that failed on a library ends on an "(error)" page instead, so a
 * failure stays visible where it happened.
 *
 * Each column keeps its busiest nodes and folds the rest into one overflow node, "+N other
 * pages". Its links carry their true counts, but a lighter weight for the layout: the overflow
 * node is never drawn taller than the busiest node it sits with, so a long tail cannot dominate
 * the graph.
 */

export interface GraphNode {
  id: string
  label: string
  column: number
  /** Set on library nodes: clicking one toggles it in the selection. */
  lib?: string
  /** Set on the node a column folds its quietest ones into: how many it stands for. */
  overflow?: number
}

export interface GraphLink {
  id: string
  source: string
  target: string
  /** The weight the layout draws the link with. Its count, except around an overflow node. */
  value: number
  /** How many requests went this way. */
  count: number
  errors: number
}

export interface Graph {
  columns: string[]
  nodes: GraphNode[]
  links: GraphLink[]
  /** The node ids an event travels through in this graph -- empty when it is not part of it. */
  route(event: McpEvent): string[]
}

export const MAX_NODES_PER_COLUMN = 12

const OPERATION_LABELS: Record<string, string> = {
  'docs://{lib}/index': 'docs index',
  'docs://pmndrs/manifest': 'manifest',
  'examples://index': 'examples index',
}

type ColumnKind = 'client' | 'operation' | 'lib' | 'page'

const COLUMNS: Record<GraphMode['kind'], ColumnKind[]> = {
  overview: ['client', 'operation', 'lib'],
  pages: ['client', 'operation', 'lib', 'page'],
  rooted: ['client', 'operation', 'page'],
}

const COLUMN_TITLES: Record<ColumnKind, string> = {
  client: 'Client',
  operation: 'Tool / resource',
  lib: 'Library',
  page: 'Page',
}

const OVERFLOW_NOUNS: Record<ColumnKind, [one: string, many: string]> = {
  client: ['client', 'clients'],
  operation: ['tool', 'tools'],
  lib: ['library', 'libraries'],
  page: ['page', 'pages'],
}

export function overflowLabel(kind: ColumnKind, hidden: number) {
  const [one, many] = OVERFLOW_NOUNS[kind]
  return `+${hidden} other ${hidden === 1 ? one : many}`
}

export function linkId(source: string, target: string) {
  return `${source} -> ${target}`
}

function rawRoute(event: McpEvent, selection: Selection, mode: GraphMode): GraphNode[] {
  if (!isSelected(event, selection)) return []
  const kinds = COLUMNS[mode.kind]
  const page = event.path ?? (!event.ok && event.lib ? '(error)' : undefined)

  const route: GraphNode[] = []
  for (const kind of kinds) {
    const column = route.length
    if (kind === 'client') {
      route.push({ id: `client:${event.client}`, label: event.client, column })
    } else if (kind === 'operation') {
      const label = OPERATION_LABELS[event.name] ?? event.name
      route.push({ id: `operation:${event.name}`, label, column })
    } else if (kind === 'lib') {
      if (!event.lib) break
      route.push({ id: `lib:${event.lib}`, label: event.lib, column, lib: event.lib })
    } else {
      if (!page || !event.lib) break
      // Keyed by library and path: two libraries can both have /getting-started/installation.
      // Labelled so too wherever more than one library is shown.
      const label = mode.kind === 'rooted' ? page : `${event.lib} · ${page}`
      route.push({ id: `page:${event.lib}:${page}`, label, column })
    }
  }
  return route
}

export function buildGraph(
  events: McpEvent[],
  selection: Selection = [],
  maxNodesPerColumn = MAX_NODES_PER_COLUMN,
): Graph {
  const mode = graphMode(selection)
  const kinds = COLUMNS[mode.kind]
  const columns = kinds.map((kind) =>
    kind === 'page' && mode.kind === 'rooted' ? `Page (${mode.lib})` : COLUMN_TITLES[kind],
  )

  // How many requests went through each node, to know which ones a column can keep
  const counts = new Map<string, { node: GraphNode; count: number }>()
  for (const event of events) {
    for (const node of rawRoute(event, selection, mode)) {
      const entry = counts.get(node.id) ?? { node, count: 0 }
      entry.count++
      counts.set(node.id, entry)
    }
  }

  const kept = new Set<string>()
  const overflow = new Map<number, { hidden: number; count: number; busiest: number }>()
  for (let column = 0; column < columns.length; column++) {
    const ranked = [...counts.values()]
      .filter(({ node }) => node.column === column)
      .sort((a, b) => b.count - a.count || a.node.label.localeCompare(b.node.label))
    // Folding a single node into the overflow would only rename it
    const room = ranked.length > maxNodesPerColumn ? maxNodesPerColumn - 1 : ranked.length
    ranked.slice(0, room).forEach(({ node }) => kept.add(node.id))
    if (ranked.length > room) {
      const rest = ranked.slice(room)
      overflow.set(column, {
        hidden: rest.length,
        count: rest.reduce((sum, { count }) => sum + count, 0),
        busiest: ranked[0].count,
      })
    }
  }

  const overflowId = (column: number) => `other:${column}`
  const resolve = (node: GraphNode): GraphNode => {
    if (kept.has(node.id)) return node
    const hidden = overflow.get(node.column)!.hidden
    return {
      id: overflowId(node.column),
      label: overflowLabel(kinds[node.column], hidden),
      column: node.column,
      overflow: hidden,
    }
  }

  const route = (event: McpEvent) =>
    rawRoute(event, selection, mode).map((node) => resolve(node).id)

  const nodes = new Map<string, GraphNode>()
  const links = new Map<string, GraphLink>()
  for (const event of events) {
    const path = rawRoute(event, selection, mode).map(resolve)
    path.forEach((node) => nodes.set(node.id, node))
    for (let index = 1; index < path.length; index++) {
      const source = path[index - 1].id
      const target = path[index].id
      const id = linkId(source, target)
      const link = links.get(id) ?? { id, source, target, value: 0, count: 0, errors: 0 }
      link.count++
      if (!event.ok) link.errors++
      links.set(id, link)
    }
  }

  // The weight each link is drawn with: scaled down around an overflow node, so that the node is
  // no taller than the busiest one it stands beside
  const scale = new Map<string, number>()
  for (const [column, { count, busiest }] of overflow) {
    scale.set(overflowId(column), Math.min(1, busiest / count))
  }
  for (const link of links.values()) {
    link.value = link.count * Math.min(scale.get(link.source) ?? 1, scale.get(link.target) ?? 1)
  }

  return { columns, nodes: [...nodes.values()], links: [...links.values()], route }
}
