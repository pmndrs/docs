'use client'

import { easeCubicInOut, easeSinInOut } from 'd3-ease'
import { sankeyLinkHorizontal } from 'd3-sankey'
import { select, type BaseType, type Selection } from 'd3-selection'
import { transition } from 'd3-transition'
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import type { McpEvent } from './event'
import { linkId, type Graph, type GraphLink, type GraphNode } from './graph'
import { LABEL_GAP, layoutGraph, NODE_WIDTH, type LaidLink, type LaidNode } from './layout'

export interface SankeyHandle {
  /** Sends one particle along the event's route. */
  spawn(event: McpEvent): void
}

/** Below this a column gets too narrow for its labels: the graph scrolls sideways instead. */
const MIN_COLUMN_WIDTH = 150
const TRANSITION_MS = 600

/** M3 roles from the site's theme, by column. */
const COLUMN_COLORS = [
  'var(--md-sys-color-primary)',
  'var(--md-sys-color-tertiary)',
  'var(--md-sys-color-secondary)',
  'var(--md-sys-color-outline)',
]

/**
 * How long a particle takes to cross the graph: slower for slower requests, within bounds that
 * keep a cached hit visible and a timeout from crawling.
 */
function travelMs(durationMs: number) {
  return Math.min(900 + durationMs * 1.5, 4500)
}

interface Particle {
  event: McpEvent
  start: number
  duration: number
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Whether to tween this update. d3 transitions only advance on animation frames, which a hidden
 * page does not get: a graph re-rooted in a background tab used to wait there with every new node
 * at opacity 0 and every old one never removed. Off screen, the update is applied as is.
 */
function shouldAnimate() {
  return document.visibilityState === 'visible' && !prefersReducedMotion()
}

/** Cuts `label` with an ellipsis until `text` fits in `maxWidth` -- the full label is its title. */
function fitLabel(text: SVGTextElement, label: string, maxWidth: number) {
  text.textContent = label
  if (text.getComputedTextLength() <= maxWidth) return
  let low = 0
  let high = label.length
  while (low < high) {
    const middle = Math.ceil((low + high) / 2)
    text.textContent = `${label.slice(0, middle)}…`
    if (text.getComputedTextLength() <= maxWidth) low = middle
    else high = middle - 1
  }
  text.textContent = low > 0 ? `${label.slice(0, low)}…` : ''
}

export function Sankey({
  graph,
  height,
  onToggleLib,
  onExpand,
  ref,
}: {
  graph: Graph
  height: number
  /** A library node was clicked. */
  onToggleLib: (lib: string) => void
  /** An overflow node ("+N other pages") was clicked. */
  onExpand: () => void
  ref?: Ref<SankeyHandle>
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // What the animation loop reads, outside React's render
  const graphRef = useRef(graph)
  const pathsRef = useRef(new Map<string, SVGPathElement>())
  const particlesRef = useRef<Particle[]>([])
  const handlersRef = useRef({ onToggleLib, onExpand })
  useEffect(() => {
    graphRef.current = graph
    handlersRef.current = { onToggleLib, onExpand }
  }, [graph, onToggleLib, onExpand])

  const [availableWidth, setAvailableWidth] = useState(0)
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    // Measured now as well: a ResizeObserver only reports on a rendering update, which a hidden
    // page does not get -- the graph would wait there with no width
    setAvailableWidth(Math.floor(wrapper.getBoundingClientRect().width))
    const observer = new ResizeObserver(([entry]) => {
      setAvailableWidth(Math.floor(entry.contentRect.width))
    })
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [])
  const width =
    availableWidth === 0 ? 0 : Math.max(availableWidth, graph.columns.length * MIN_COLUMN_WIDTH)

  useImperativeHandle(ref, () => ({
    spawn(event) {
      if (!shouldAnimate()) return
      particlesRef.current.push({
        event,
        start: performance.now(),
        duration: travelMs(event.durationMs),
      })
    },
  }))

  //
  // The graph itself: d3 owns the SVG's groups, joined by id so updates transition
  //

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || width === 0) return

    const { nodes, links, columnX } = layoutGraph(graph, width, height)
    const root = select(svg)
    const linkPath = sankeyLinkHorizontal<GraphNode, GraphLink>()
    const strokeWidth = (link: LaidLink) => Math.max(1, link.width ?? 1)
    const isOverflow = (node: unknown) => (node as LaidNode).overflow !== undefined
    // Fainter towards an overflow node: it stands for many requests, none of them in particular
    const strokeOpacity = (link: LaidLink) =>
      isOverflow(link.source) || isOverflow(link.target) ? 0.2 : 0.5

    // One code path, tweened or not: `move` applies an update through a transition when the page
    // can animate it, and straight away otherwise -- interrupting whatever was under way, so a
    // stale tween cannot land after it.
    const animate = shouldAnimate()
    const tween = transition().duration(TRANSITION_MS).ease(easeCubicInOut)
    function move<E extends BaseType, D>(selection: Selection<E, D, BaseType, unknown>) {
      return animate
        ? (selection.transition(tween) as unknown as Selection<E, D, BaseType, unknown>)
        : selection.interrupt()
    }

    root
      .select<SVGGElement>('g[data-layer="headers"]')
      .selectAll<SVGTextElement, string>('text')
      .data(graph.columns)
      .join('text')
      .attr('x', (_, column) => columnX[column])
      .attr('y', 14)
      .attr('class', 'text-xs font-medium uppercase tracking-wide')
      .style('fill', 'var(--md-sys-color-on-surface-variant)')
      .text((label) => label)

    const linkPaths = root
      .select<SVGGElement>('g[data-layer="links"]')
      .selectAll<SVGPathElement, LaidLink>('path')
      .data(links, (link) => link.id)
      .join(
        (enter) =>
          enter
            .append('path')
            .attr('fill', 'none')
            .attr('stroke', 'var(--md-sys-color-outline-variant)')
            .attr('d', linkPath)
            .attr('stroke-width', animate ? 0 : strokeWidth)
            .attr('stroke-opacity', animate ? 0 : strokeOpacity),
        (update) => update,
        (exit) => {
          if (animate) exit.transition(tween).attr('stroke-opacity', 0).remove()
          else exit.interrupt().remove()
          return exit
        },
      )

    move(linkPaths)
      .attr('d', linkPath)
      .attr('stroke-width', strokeWidth)
      .attr('stroke-opacity', strokeOpacity)

    linkPaths
      .selectAll('title')
      .data((link) => [link])
      .join('title')
      .text((link) => {
        const source = link.source as unknown as LaidNode
        const target = link.target as unknown as LaidNode
        const errors = link.errors ? `, ${link.errors} failed` : ''
        return `${source.label} -> ${target.label}: ${link.count} requests${errors}`
      })

    const paths = new Map<string, SVGPathElement>()
    linkPaths.each(function (link) {
      paths.set(link.id, this)
    })
    pathsRef.current = paths

    const nodeGroups = root
      .select<SVGGElement>('g[data-layer="nodes"]')
      .selectAll<SVGGElement, LaidNode>('g')
      .data(nodes, (node) => node.id)
      .join(
        (enter) => {
          const group = enter
            .append('g')
            .attr('opacity', animate ? 0 : 1)
            .attr('transform', (node) => `translate(${node.x0},${node.y0})`)
          group.append('rect').attr('width', NODE_WIDTH).attr('rx', 2)
          group
            .append('text')
            .attr('dy', '0.35em')
            .attr('x', NODE_WIDTH + LABEL_GAP)
            .attr('class', 'text-xs')
            .style('fill', 'var(--md-sys-color-on-surface)')
            .style('paint-order', 'stroke')
            .style('stroke', 'var(--md-sys-color-surface)')
            .style('stroke-width', '3px')
            .style('stroke-linejoin', 'round')
          group.append('title')
          return group
        },
        (update) => update,
        (exit) => {
          if (animate) exit.transition(tween).attr('opacity', 0).remove()
          else exit.interrupt().remove()
          return exit
        },
      )

    // Library nodes toggle their library in the selection; overflow nodes show more
    const isActionable = (node: LaidNode) => node.lib !== undefined || isOverflow(node)
    const act = (node: LaidNode) => {
      if (node.lib) handlersRef.current.onToggleLib(node.lib)
      else if (isOverflow(node)) handlersRef.current.onExpand()
    }
    nodeGroups
      .classed('cursor-pointer', isActionable)
      .attr('role', (node) => (isActionable(node) ? 'button' : null))
      .attr('tabindex', (node) => (isActionable(node) ? 0 : null))
      .attr('aria-label', (node) =>
        node.lib
          ? `Toggle ${node.lib} in the selection`
          : isOverflow(node)
            ? `${node.label}: show more`
            : null,
      )
      .on('click', (_, node) => act(node))
      .on('keydown', (event: KeyboardEvent, node) => {
        if (isActionable(node) && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          act(node)
        }
      })

    move(nodeGroups)
      .attr('opacity', 1)
      .attr('transform', (node) => `translate(${node.x0},${node.y0})`)

    // An overflow node is drawn as an outline, dashed and muted: a placeholder, not a peer
    nodeGroups
      .select('rect')
      .style('fill', (node) => (isOverflow(node) ? 'transparent' : COLUMN_COLORS[node.column]))
      .style('stroke', (node) => (isOverflow(node) ? 'var(--md-sys-color-outline)' : null))
      .style('stroke-dasharray', (node) => (isOverflow(node) ? '3 2' : null))
    nodeGroups
      .select('text')
      .style('fill', (node) =>
        isOverflow(node)
          ? 'var(--md-sys-color-on-surface-variant)'
          : 'var(--md-sys-color-on-surface)',
      )
    move(nodeGroups.select<SVGRectElement>('rect')).attr('height', (node) =>
      Math.max(2, (node.y1 ?? 0) - (node.y0 ?? 0)),
    )

    nodeGroups.select<SVGTextElement>('text').each(function (node) {
      fitLabel(this, node.label, node.labelWidth)
    })
    move(nodeGroups.select<SVGTextElement>('text')).attr(
      'y',
      (node) => ((node.y1 ?? 0) - (node.y0 ?? 0)) / 2,
    )

    nodeGroups.select('title').text((node) => {
      // The links' true counts: their values are only weights around an overflow node
      const count = (links: LaidLink[] = []) => links.reduce((sum, link) => sum + link.count, 0)
      const requests = Math.max(
        count(node.sourceLinks as LaidLink[]),
        count(node.targetLinks as LaidLink[]),
      )
      return `${node.label}: ${requests} requests${isOverflow(node) ? ' -- click to show more' : ''}`
    })
  }, [graph, width, height])

  //
  // Particles: one canvas over the SVG, drawn along the live link paths
  //

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context || width === 0) return

    const ratio = window.devicePixelRatio || 1
    canvas.width = width * ratio
    canvas.height = height * ratio
    context.setTransform(ratio, 0, 0, ratio, 0, 0)

    const style = getComputedStyle(canvas)
    const colors = {
      ok: style.getPropertyValue('--md-sys-color-primary').trim(),
      error: style.getPropertyValue('--md-sys-color-error').trim(),
    }

    /** Where an event's particle is, `progress` (0..1) of the way along its route. */
    const locate = (event: McpEvent, progress: number) => {
      const route = graphRef.current.route(event)
      if (route.length < 2) return null
      const segments = route.length - 1
      const position = Math.min(progress, 0.9999) * segments
      const segment = Math.floor(position)
      const path = pathsRef.current.get(linkId(route[segment], route[segment + 1]))
      if (!path) return null
      const length = path.getTotalLength()
      return path.getPointAtLength((position - segment) * length)
    }

    let frame = 0
    const draw = (now: number) => {
      context.clearRect(0, 0, width, height)
      particlesRef.current = particlesRef.current.filter(
        ({ start, duration }) => now - start < duration,
      )

      for (const { event, start, duration } of particlesRef.current) {
        const progress = easeSinInOut((now - start) / duration)
        const color = event.ok ? colors.ok : colors.error

        // A short tail: the same particle a little earlier, fainter
        for (let tail = 4; tail >= 0; tail--) {
          const point = locate(event, Math.max(0, progress - tail * 0.012))
          if (!point) continue
          context.globalAlpha = 1 - tail * 0.2
          context.fillStyle = color
          context.shadowColor = color
          context.shadowBlur = tail === 0 ? 8 : 0
          context.beginPath()
          context.arc(point.x, point.y, tail === 0 ? 3.5 : 2.5, 0, Math.PI * 2)
          context.fill()
        }
      }
      context.globalAlpha = 1
      context.shadowBlur = 0
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [width, height])

  return (
    <div ref={wrapperRef} className="w-full overflow-x-auto">
      <div className="relative" style={{ width: width || '100%', height }}>
        <svg ref={svgRef} width={width} height={height} className="block">
          <g data-layer="headers" />
          <g data-layer="links" />
          <g data-layer="nodes" />
        </svg>
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ width, height }}
        />
      </div>
    </div>
  )
}
