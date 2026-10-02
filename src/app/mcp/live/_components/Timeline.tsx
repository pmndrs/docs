'use client'

import type { McpEvent } from './event'
import cn from '@/lib/cn'
import { useEffect, useState } from 'react'

const SPAN_MS = 5 * 60 * 1000
const MINUTE_MS = 60 * 1000

const time = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function describeEvent(event: McpEvent) {
  const target = [event.lib, event.path].filter(Boolean).join(' ')
  return [
    `${event.client} -> ${event.name}`,
    target,
    `${event.durationMs} ms`,
    event.ok ? undefined : 'failed',
  ]
    .filter(Boolean)
    .join(' · ')
}

/**
 * The last five minutes, one dot per request, sliding with the clock. Doubles as the feed: the
 * line under it reads out the dot under the pointer, else the latest request.
 */
export function Timeline({ events }: { events: McpEvent[] }) {
  const [now, setNow] = useState(0)
  useEffect(() => {
    setNow(Date.now())
    const interval = setInterval(() => setNow(Date.now()), 1_000)
    return () => clearInterval(interval)
  }, [])

  const [hovered, setHovered] = useState<McpEvent>()

  const start = now - SPAN_MS
  const visible = now === 0 ? [] : events.filter(({ ts }) => ts >= start)
  const x = (ts: number) => `${((ts - start) / SPAN_MS) * 100}%`
  const shown = hovered ?? visible.at(-1)

  return (
    <figure className="flex flex-col gap-2">
      <svg
        className="h-8 w-full overflow-visible"
        role="img"
        aria-label={`${visible.length} requests in the last 5 minutes`}
      >
        <line
          x1="0"
          x2="100%"
          y1="50%"
          y2="50%"
          style={{ stroke: 'var(--md-sys-color-outline-variant)' }}
        />
        {[1, 2, 3, 4].map((minutes) => (
          <line
            key={minutes}
            x1={`${(1 - (minutes * MINUTE_MS) / SPAN_MS) * 100}%`}
            x2={`${(1 - (minutes * MINUTE_MS) / SPAN_MS) * 100}%`}
            y1="30%"
            y2="70%"
            style={{ stroke: 'var(--md-sys-color-outline-variant)' }}
          />
        ))}
        {visible.map((event) => (
          <circle
            key={event.id}
            cx={x(event.ts)}
            cy="50%"
            r={hovered?.id === event.id ? 5 : 3.5}
            className="cursor-default transition-[cx] duration-1000 ease-linear"
            style={{
              fill: event.ok ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-error)',
              fillOpacity: 0.8,
            }}
            onPointerEnter={() => setHovered(event)}
            onPointerLeave={() => setHovered(undefined)}
          >
            <title>{`${time.format(event.ts)} · ${describeEvent(event)}`}</title>
          </circle>
        ))}
      </svg>
      <figcaption className="flex justify-between gap-4 text-xs text-on-surface-variant">
        <span className="shrink-0">-5 min</span>
        <span className={cn('min-w-0 truncate font-mono', shown && !shown.ok && 'text-error')}>
          {shown ? `${time.format(shown.ts)} · ${describeEvent(shown)}` : 'No requests yet'}
        </span>
        <span className="shrink-0">now</span>
      </figcaption>
    </figure>
  )
}
