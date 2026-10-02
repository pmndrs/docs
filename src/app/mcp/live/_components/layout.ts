import { sankey, type SankeyLink as D3SankeyLink, type SankeyNode as D3SankeyNode } from 'd3-sankey'
import type { Graph, GraphLink, GraphNode } from './graph'

export type LaidNode = D3SankeyNode<GraphNode, GraphLink> & {
  /** How wide its label may be before it is cut with an ellipsis. */
  labelWidth: number
}
export type LaidLink = D3SankeyLink<GraphNode, GraphLink> & GraphLink

export interface Layout {
  nodes: LaidNode[]
  links: LaidLink[]
  /** Where each column's heading starts. */
  columnX: number[]
}

export const NODE_WIDTH = 10
export const HEADER_HEIGHT = 28
/** Between a node and its label, and between a label and the next column. */
export const LABEL_GAP = 6
/**
 * Vertical room between two nodes of a column. Each label is centred on its node, so the centres
 * of two neighbours are at least this far apart -- more than a line of the labels' text, which
 * is what keeps them from overlapping.
 */
export const NODE_PADDING = 18
/** The share of the width kept right of the last column, for its labels -- the longest ones. */
const LAST_LABELS_SHARE = 0.26
const LAST_LABELS_MAX = 280

/** The height a graph needs for its busiest column to keep `NODE_PADDING` between nodes. */
export function heightFor(graph: Graph, rowHeight = NODE_PADDING + 12) {
  const rows = Math.max(
    0,
    ...graph.columns.map(
      (_, column) => graph.nodes.filter((node) => node.column === column).length,
    ),
  )
  return HEADER_HEIGHT + rows * rowHeight
}

/**
 * Lays the graph out over `width` x `height`, with every column in a fixed slot and every label to
 * the right of its node, given the width it can have before reaching the next column.
 */
export function layoutGraph(graph: Graph, width: number, height: number): Layout {
  const lastLabels = Math.min(LAST_LABELS_MAX, width * LAST_LABELS_SHARE)
  const slots = graph.columns.length - 1
  const step = (width - lastLabels - NODE_WIDTH) / slots
  const columnX = graph.columns.map((_, column) => column * step)

  if (graph.nodes.length === 0) return { nodes: [], links: [], columnX }

  const { nodes, links } = sankey<GraphNode, GraphLink>()
    .nodeId((node) => node.id)
    .nodeAlign((node) => node.column)
    .nodeWidth(NODE_WIDTH)
    .nodePadding(NODE_PADDING)
    // Busiest first, and an overflow node last, whatever its weight: it is the tail
    .nodeSort(
      (a, b) =>
        Number(a.overflow !== undefined) - Number(b.overflow !== undefined) ||
        (b.value ?? 0) - (a.value ?? 0) ||
        a.label.localeCompare(b.label),
    )
    .extent([
      [0, HEADER_HEIGHT],
      [width, height - 4],
    ])({
    nodes: graph.nodes.map((node) => ({ ...node })),
    links: graph.links.map((link) => ({ ...link })),
  })

  // d3-sankey spreads whichever columns are present over the whole width. Pin them to fixed
  // slots instead, so a column does not jump sideways when the last one empties or fills.
  const laid = nodes as LaidNode[]
  for (const node of laid) {
    node.x0 = columnX[node.column]
    node.x1 = node.x0 + NODE_WIDTH
    const end = node.column === slots ? width : columnX[node.column + 1] - LABEL_GAP
    node.labelWidth = Math.max(0, end - node.x1 - LABEL_GAP)
  }

  return { nodes: laid, links: links as LaidLink[], columnX }
}
