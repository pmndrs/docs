// PROTOTYPE — throwaway. Variant C: "Palette".
//
// This one disagrees with the premise. There is no menu of libraries: the whole
// corpus is flattened into one list and you type at it. `scroll` finds
// ScrollControls in drei and useScroll in r3f without you having to know which
// library owns it — which is the thing a menu can never do.
//
// The bet: nobody browses documentation. They look something up.

import { createCliRenderer, type CliRenderer, type SelectOption } from '@opentui/core'
import { createRoot, useKeyboard, useTerminalDimensions } from '@opentui/react'
import { spawn } from 'node:child_process'
import { useEffect, useMemo, useState } from 'react'
import { NEXT, PREV, seededQuery, snapshotIfAsked, variants } from './browse.prototype.switcher'
import { corpus, libs, webUrl, type Page } from './browse.prototype.corpus'
import { Lines } from './browse.prototype.lines'
import { renderMarkdown } from './browse.prototype.markdown'

let renderer: CliRenderer

function leave(code: number) {
  // Exiting straight out of a key handler cuts OpenTUI's pending write and
  // leaves the terminal mid-frame. Tear down, then exit on the next tick.
  renderer.destroy()
  setTimeout(() => process.exit(code), 50)
}

/** Subsequence match, scored so that tighter and earlier matches win. */
function score(haystack: string, needle: string): number | undefined {
  if (!needle) return 0
  let at = 0
  let first = -1
  let last = 0
  for (const char of needle) {
    const found = haystack.indexOf(char, at)
    if (found === -1) return undefined
    if (first === -1) first = found
    last = found
    at = found + 1
  }
  return (last - first) * 4 + first
}

function App() {
  const { width, height } = useTerminalDimensions()
  const [all, setAll] = useState<Page[]>([])
  const [query, setQuery] = useState(seededQuery())
  const [hit, setHit] = useState(0)
  const [reading, setReading] = useState<Page | undefined>()

  useEffect(() => {
    corpus().then(setAll)
  }, [])

  const results = useMemo(() => {
    const needle = query.toLowerCase().replace(/\s+/g, '')
    return all
      .map((page) => ({
        page,
        rank: score(`${page.lib.name}${page.title}${page.path}`.toLowerCase(), needle),
      }))
      .filter((row): row is { page: Page; rank: number } => row.rank !== undefined)
      .sort((a, b) => a.rank - b.rank || a.page.title.length - b.page.title.length)
      .slice(0, 200)
      .map((row) => row.page)
  }, [all, query])

  const body = useMemo(
    () => (reading ? renderMarkdown(reading.body, Math.min(width - 6, 100)) : []),
    [reading, width],
  )

  useKeyboard((key) => {
    // The query field is not an <input>: the results list keeps the focus so
    // ↑↓⏎ always drive it, and typing is routed here by hand. `<` and `>` are
    // query text while searching, so ctrl+←/→ is the switcher in this variant.
    if (key.ctrl && (key.name === 'left' || key.name === 'right')) {
      return leave(key.name === 'left' ? PREV : NEXT)
    }
    if (key.ctrl && key.name === 'c') return leave(0)

    if (reading) {
      if (key.sequence === '<') return leave(PREV)
      if (key.sequence === '>') return leave(NEXT)
      if (key.name === 'escape' || key.name === 'q') setReading(undefined)
      else if (key.name === 'o') spawn('open', [webUrl(reading)], { stdio: 'ignore' }).unref()
      return
    }

    if (key.name === 'escape') return leave(0)
    if (key.name === 'backspace') return setQuery((q) => q.slice(0, -1))
    if (key.sequence && key.sequence.length === 1 && key.sequence >= ' ') {
      setQuery((q) => q + key.sequence)
      setHit(0)
    }
  })

  if (reading) {
    return (
      <box style={{ flexDirection: 'column', width, height }}>
        <box
          title={`${reading.lib.title} · ${reading.path}`}
          titleColor="#89ddff"
          style={{ border: true, flexGrow: 1 }}
        >
          <scrollbox focused style={{ paddingLeft: 1, paddingRight: 1 }}>
            <Lines lines={body} />
          </scrollbox>
        </box>
        <box style={{ height: 1, paddingLeft: 1 }}>
          <text>
            <span fg="#5a5a5a">
              {'↑↓ scroll · esc back to search · o open in browser · < > variant'}
            </span>
          </text>
        </box>
      </box>
    )
  }

  const options: SelectOption[] = results.map((page) => ({
    name: `${page.lib.name.padEnd(18)} ${page.title.padEnd(28)} ${page.path}`,
    description: page.path,
    value: page.path,
  }))

  return (
    <box style={{ flexDirection: 'column', width, height }}>
      <box style={{ border: true, height: 3, paddingLeft: 1 }}>
        <text>
          <span fg="#c3e88d">{'❯ '}</span>
          {query ? (
            <span fg="#ffffff">{`${query}▌`}</span>
          ) : (
            <span fg="#5a5a5a">
              {all.length
                ? `search ${all.length} pages across ${libs.length} libraries…`
                : 'loading the corpus…'}
            </span>
          )}
        </text>
      </box>
      <box style={{ height: height - 4, paddingLeft: 1 }}>
        <select
          style={{ height: height - 4 }}
          showDescription={false}
          options={options}
          focused
          onChange={(index) => setHit(index)}
          onSelect={(index) => setReading(results[index])}
        />
      </box>
      <box style={{ height: 1, paddingLeft: 1 }}>
        <text>
          <span fg="#1a1b26" bg="#c3e88d">
            {` C — ${variants.c} `}
          </span>
          <span fg="#5a5a5a">
            {`  ${results.length} hits · ⏎ read · ctrl+←/→ variant · esc quit`}
          </span>
        </text>
      </box>
    </box>
  )
}

export async function run() {
  renderer = await createCliRenderer({ exitOnCtrlC: false })
  createRoot(renderer).render(<App />)
  snapshotIfAsked(renderer)
}
