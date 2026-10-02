'use client'

import { Badge } from '@/components/ui/badge'
import cn from '@/lib/cn'
import { libs as LIBS } from '@/libs'
import { ArrowUpRightIcon } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { WINDOW_MS, type McpEvent } from './event'
import { buildGraph, MAX_NODES_PER_COLUMN } from './graph'
import { HEADER_HEIGHT, heightFor, NODE_PADDING } from './layout'
import { LibFilter } from './LibFilter'
import { Sankey, type SankeyHandle } from './Sankey'
import { formatSelection, graphMode, isSelected, toggleLib, type Selection } from './selection'
import { useStreamGate } from './stream-gate'
import { Timeline } from './Timeline'
import { useMcpEvents, type StreamStatus } from './use-mcp-events'

const MCP_ENDPOINT = 'https://docs.pmnd.rs/api/mcp'

/** The full view, showing the same selection. */
function fullView(basePath: string, selection: Selection) {
  const lib = formatSelection(selection)
  return `${basePath}/mcp/live${lib ? `?lib=${encodeURIComponent(lib)}` : ''}`
}

/**
 * Every library the MCP server serves -- those with a `llms_full` dump, as in its route -- and
 * the example gallery, which requests name like one.
 */
const KNOWN_LIBS = [
  ...Object.entries(LIBS)
    .filter(([, lib]) => 'llms_full' in lib && lib.llms_full)
    .map(([name]) => name),
  'examples',
]

const STATUS_LABELS: Record<StreamStatus, string> = {
  paused: 'Paused',
  connecting: 'Connecting',
  live: 'Live',
  reconnecting: 'Reconnecting',
  offline: 'Offline',
}

const FULL_MIN_HEIGHT = 260
const FULL_MAX_HEIGHT = 1200
/** Fixed, so the page around it never moves -- whatever the state, whatever the traffic. */
const COMPACT_HEIGHT = 280
/** As many nodes as a column of the compact graph has room for. */
const COMPACT_ROWS = Math.floor((COMPACT_HEIGHT - HEADER_HEIGHT) / (NODE_PADDING + 8))
/** How many more nodes per column each click on an overflow node shows, in the full view. */
const EXPAND_STEP = 8

const EMPTY: Selection = []

const WINDOW_MINUTES = WINDOW_MS / 60_000

interface McpLiveProps {
  /** The app's `basePath`: the stream and the full view are served beside this page. */
  basePath: string
  /**
   * `compact` (the default) for `/mcp/live?embed`: a fixed height, and a link to the full view.
   * `full` for `/mcp/live`: as tall as the graph needs.
   */
  variant?: 'compact' | 'full'
  /** The libraries the graph is restricted to. Leave it out for the component to keep its own. */
  selection?: Selection
  onSelectionChange?: (selection: Selection) => void
  className?: string
}

/**
 * The requests the pmndrs docs MCP server is serving, live: a Sankey of client -> tool/resource
 * -> library (-> page) over the window the server keeps, one particle per request as it comes in, and a
 * timeline of the last five minutes under it. Pick libraries to see their pages.
 *
 * It streams only while on screen in a visible tab.
 */
export function McpLive({
  basePath,
  variant = 'compact',
  selection: controlledSelection,
  onSelectionChange,
  className,
}: McpLiveProps) {
  const compact = variant === 'compact'

  const [localSelection, setLocalSelection] = useState<Selection>(EMPTY)
  const selection = onSelectionChange ? (controlledSelection ?? EMPTY) : localSelection
  const setSelection = onSelectionChange ?? setLocalSelection

  const rootRef = useRef<HTMLDivElement>(null)
  const open = useStreamGate(rootRef)

  const sankeyRef = useRef<SankeyHandle>(null)
  const onLive = useCallback((event: McpEvent) => sankeyRef.current?.spawn(event), [])

  // Everything is streamed, and the selection filters here: changing it is then instant and
  // animated, rather than a reconnection that would start the graph over
  const { events, status } = useMcpEvents(`${basePath}/mcp/live/events`, open, onLive)

  const [extraRows, setExtraRows] = useState(0)
  const rows = compact ? COMPACT_ROWS : MAX_NODES_PER_COLUMN + extraRows
  const graph = useMemo(() => buildGraph(events, selection, rows), [events, selection, rows])

  const visibleEvents = useMemo(
    () => events.filter((event) => isSelected(event, selection)),
    [events, selection],
  )

  // Every library on offer, with its count in the window: the known ones first, then any other
  // a request named
  const { libs, counts } = useMemo(() => {
    const counts = new Map<string, number>()
    for (const { lib } of events) if (lib) counts.set(lib, (counts.get(lib) ?? 0) + 1)
    const others = [...counts.keys()].filter((lib) => !KNOWN_LIBS.includes(lib)).sort()
    return { libs: [...KNOWN_LIBS, ...others], counts }
  }, [events])

  const onToggleLib = useCallback(
    (lib: string) => setSelection(toggleLib(selection, lib)),
    [selection, setSelection],
  )
  const onExpand = useCallback(() => {
    // The compact graph has no room to grow: the full view has, in a tab of its own -- this one is
    // typically in an iframe
    if (compact) window.open(fullView(basePath, selection), '_blank', 'noopener')
    else setExtraRows((rows) => rows + EXPAND_STEP)
  }, [compact, basePath, selection])

  const height = compact
    ? COMPACT_HEIGHT
    : Math.min(FULL_MAX_HEIGHT, Math.max(FULL_MIN_HEIGHT, heightFor(graph)))

  return (
    <div ref={rootRef} className={cn('flex flex-col gap-4', className)}>
      {/* The status line: it never moves, whatever is selected */}
      <div className="flex min-h-8 flex-wrap items-center gap-2">
        <Badge variant={status === 'live' ? 'default' : 'secondary'} className="gap-1.5">
          <span
            aria-hidden
            className={cn(
              'size-1.5 rounded-full bg-current',
              status === 'live' && 'motion-safe:animate-pulse',
            )}
          />
          {STATUS_LABELS[status]}
        </Badge>
        <span className="text-sm text-on-surface-variant">
          {visibleEvents.length} MCP {visibleEvents.length === 1 ? 'request' : 'requests'} in the
          last {WINDOW_MINUTES} minutes
        </span>
        {compact && (
          <a
            href={fullView(basePath, selection)}
            target="_blank"
            rel="noopener"
            className="ms-auto inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Open full view
            <ArrowUpRightIcon className="size-4" aria-hidden />
          </a>
        )}
      </div>

      {/* The filter, on a row of its own, at least one row tall so the first chip moves nothing.
          The full view lets the chips wrap; the compact one, at a fixed height in its iframe,
          keeps them on that one row and scrolls it sideways. */}
      <div
        className={cn(
          'flex min-h-8 items-center gap-2',
          compact ? 'no-scrollbar flex-nowrap overflow-x-auto' : 'flex-wrap',
        )}
      >
        <LibFilter libs={libs} counts={counts} selection={selection} onChange={setSelection} />
      </div>

      <div style={{ minHeight: height }} className="flex flex-col gap-2">
        {visibleEvents.length === 0 ? (
          <EmptyState status={status} selection={selection} height={height} />
        ) : (
          <Sankey
            ref={sankeyRef}
            graph={graph}
            height={height}
            onToggleLib={onToggleLib}
            onExpand={onExpand}
          />
        )}
        {/* Its line is kept when empty, so that changing the selection moves nothing */}
        <p className="min-h-4 text-xs text-on-surface-variant">
          {visibleEvents.length > 0 &&
            graphMode(selection).kind === 'overview' &&
            'Select a library (up to three) to see its pages.'}
        </p>
      </div>

      <Timeline events={visibleEvents} />

      <p className="text-xs text-on-surface-variant">
        Partial live view — events from the instance serving this stream. Each server instance only
        sees the requests it handled, and keeps the last {WINDOW_MINUTES} minutes in memory.
      </p>
    </div>
  )
}

function EmptyState({
  status,
  selection,
  height,
}: {
  status: StreamStatus
  selection: Selection
  height: number
}) {
  const offline = status === 'offline'
  return (
    <div
      style={{ height }}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant p-8 text-center"
    >
      <p className={cn('font-medium', offline && 'text-error')}>
        {offline
          ? 'The live stream is unavailable'
          : selection.length > 0
            ? `No MCP request about ${selection.join(', ')} yet`
            : 'No MCP request yet'}
      </p>
      <p className="max-w-md text-sm text-on-surface-variant">
        {offline ? (
          <>It could not be reached from here. Try again later, or open the full view.</>
        ) : (
          <>
            Connect an agent to <code className="font-mono">{MCP_ENDPOINT}</code> and its requests
            show up here.
          </>
        )}
      </p>
    </div>
  )
}
