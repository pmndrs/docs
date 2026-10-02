'use client'

import cn from '@/lib/cn'
import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_DAYS, type DailyStats, type McpStatsPayload } from './stats'

const day = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })

type Status = 'loading' | 'ready' | 'offline'

/** The counts of `pick` over `days`, summed, largest first. */
function totals(days: DailyStats[], pick: (day: DailyStats) => Record<string, number>) {
  const sums = new Map<string, number>()
  for (const day of days) {
    for (const [name, count] of Object.entries(pick(day))) {
      sums.set(name, (sums.get(name) ?? 0) + count)
    }
  }
  return [...sums].sort(([, a], [, b]) => b - a)
}

/**
 * The last `DEFAULT_DAYS` days of the MCP server, from `/mcp/live/stats`: per day, how many
 * clients connected and how many tool calls they made, then the window's totals by client and by
 * tool. Read once, when shown: a day's counters move slowly.
 *
 * Connections are labelled as the handshakes they are, apart from the tool calls: a client
 * connects when it starts, whether or not it then asks anything.
 */
export function DailyStatsView({ basePath }: { basePath: string }) {
  const [days, setDays] = useState<DailyStats[]>([])
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${basePath}/mcp/live/stats`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`${response.status}`)
        setDays(((await response.json()) as McpStatsPayload).days)
        setStatus('ready')
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('offline')
      })
    return () => controller.abort()
  }, [basePath])

  const connections = useMemo(() => days.reduce((sum, day) => sum + day.connections, 0), [days])
  const calls = useMemo(() => days.reduce((sum, day) => sum + day.calls, 0), [days])
  const byClient = useMemo(() => totals(days, (day) => day.clients), [days])
  const byTool = useMemo(() => totals(days, (day) => day.tools), [days])
  const max = Math.max(1, ...days.map((day) => Math.max(day.connections, day.calls)))

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Last {DEFAULT_DAYS} days</h2>
        <p className="max-w-2xl text-sm text-on-surface-variant">
          Per UTC day. A connection is an MCP handshake: a client sends one each time it opens the
          server, whether or not it then asks anything — the tool calls are the uses.
        </p>
      </header>

      {status === 'loading' ? (
        <p className="text-sm text-on-surface-variant">Loading…</p>
      ) : status === 'offline' ? (
        <p className="text-sm text-error">The daily counters are unavailable.</p>
      ) : (
        <>
          <p className="text-sm text-on-surface-variant">
            <strong className="font-medium text-on-surface">{connections}</strong> connections
            (handshakes) and <strong className="font-medium text-on-surface">{calls}</strong> tool
            calls.
          </p>

          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="text-start text-xs text-on-surface-variant">
                <th scope="col" className="py-1 pe-3 text-start font-normal">
                  Day
                </th>
                <th scope="col" className="py-1 pe-3 text-start font-normal">
                  Connections (handshakes)
                </th>
                <th scope="col" className="py-1 text-start font-normal">
                  Tool calls
                </th>
              </tr>
            </thead>
            <tbody>
              {days.map((row) => (
                <tr key={row.date} className="border-t border-outline-variant">
                  <th scope="row" className="py-1 pe-3 text-start font-normal whitespace-nowrap">
                    <time dateTime={row.date}>{day.format(new Date(row.date))}</time>
                  </th>
                  <td className="py-1 pe-3">
                    <Bar value={row.connections} max={max} className="bg-secondary" />
                  </td>
                  <td className="py-1">
                    <Bar value={row.calls} max={max} className="bg-primary" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid gap-6 sm:grid-cols-2">
            <Totals title="Connections (handshakes) by client" entries={byClient} />
            <Totals title="Tool calls by tool" entries={byTool} />
          </div>
        </>
      )}
    </section>
  )
}

/** A count, and a bar as long as its share of `max`. */
function Bar({ value, max, className }: { value: number; max: number; className: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 shrink-0 text-end">{value}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full">
        <div
          aria-hidden
          className={cn('h-full rounded-full', className)}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  )
}

function Totals({ title, entries }: { title: string; entries: [string, number][] }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-xs text-on-surface-variant">{title}</h3>
      {entries.length === 0 ? (
        <p className="text-sm text-on-surface-variant">None yet.</p>
      ) : (
        <ul className="flex flex-col gap-0.5 text-sm tabular-nums">
          {entries.map(([name, count]) => (
            <li key={name} className="flex justify-between gap-4">
              <span className="truncate font-mono">{name}</span>
              <span>{count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
