// PROTOTYPE — throwaway. Variant C: "Palette".
//
// This one disagrees with the premise. There is no menu of libraries: the whole
// corpus is flattened into one list and you type at it. `instanc` finds drei's
// Instances without you having to know which library owns it — which is the
// thing a menu can never do.
//
// The bet: nobody browses documentation. They look something up.

import { Box, render, Text, useInput, useWindowSize, type Instance } from 'ink'
import { spawn } from 'node:child_process'
import { useEffect, useMemo, useState } from 'react'
import { corpus, libs, webUrl, type Page } from './browse.prototype.corpus'
import { Lines } from './browse.prototype.lines'
import { List, moveCursor } from './browse.prototype.list'
import { renderMarkdown } from './browse.prototype.markdown'
import {
  leaveWith,
  NEXT,
  PREV,
  seededOpen,
  seededQuery,
  renderOptions,
  snapshotIfAsked,
  variants,
} from './browse.prototype.switcher'

let app: Instance

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
  const { columns, rows } = useWindowSize()
  const [all, setAll] = useState<Page[]>([])
  const [query, setQuery] = useState(seededQuery())
  const [hit, setHit] = useState(0)
  const [reading, setReading] = useState<Page | undefined>()
  const [scroll, setScroll] = useState(0)

  useEffect(() => {
    corpus().then((pages) => {
      setAll(pages)
      const wanted = seededOpen()
      if (wanted) setReading(pages.find((p) => p.path === wanted))
    })
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
    () => (reading ? renderMarkdown(reading.body, Math.min(columns - 6, 100)) : []),
    [reading, columns],
  )

  useInput((input, key) => {
    // The query field is not a text input: typing is routed here by hand so ↑↓⏎
    // always drive the list. `<` and `>` are query text while searching, so
    // ctrl+←/→ is the switcher in this variant.
    if (key.ctrl && key.leftArrow) return leaveWith(app, PREV)
    if (key.ctrl && key.rightArrow) return leaveWith(app, NEXT)
    if (key.ctrl && input === 'c') return leaveWith(app, 0)

    if (reading) {
      if (input === '<') return leaveWith(app, PREV)
      if (input === '>') return leaveWith(app, NEXT)
      if (key.escape || input === 'q') return setReading(undefined)
      if (input === 'o') return void spawn('open', [webUrl(reading)], { stdio: 'ignore' }).unref()
      const step = key.upArrow || input === 'k' ? -1 : key.downArrow || input === 'j' ? 1 : 0
      if (step) {
        const max = Math.max(0, body.length - rows + 3)
        setScroll((s) => Math.max(0, Math.min(s + step * 3, max)))
      }
      return
    }

    if (key.escape) return leaveWith(app, 0)
    if (key.return) {
      if (!results[hit]) return
      setScroll(0)
      return setReading(results[hit])
    }
    if (key.upArrow) return setHit((i) => moveCursor(i, -1, results.length))
    if (key.downArrow) return setHit((i) => moveCursor(i, 1, results.length))
    if (key.delete || key.backspace) return setQuery((q) => q.slice(0, -1))
    if (input && !key.ctrl && !key.meta && input >= ' ') {
      setQuery((q) => q + input)
      setHit(0)
    }
  })

  if (reading) {
    return (
      <Box flexDirection="column" width={columns} height={rows}>
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor="cyan"
          flexGrow={1}
          paddingLeft={1}
          paddingRight={1}
        >
          <Text wrap="truncate" color="cyan">{`${reading.lib.title} · ${reading.path}`}</Text>
          <Lines lines={body.slice(scroll, scroll + rows - 4)} />
        </Box>
        <Box height={1} flexShrink={0}>
          <Text dimColor>{'↑↓ scroll · esc back to search · o open in browser · < > variant'}</Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" width={columns} height={rows}>
      <Box borderStyle="round" borderColor="green" flexShrink={0} paddingLeft={1}>
        <Text wrap="truncate">
          <Text color="green">{'❯ '}</Text>
          {query ? (
            <Text>{`${query}▌`}</Text>
          ) : (
            <Text dimColor>
              {all.length
                ? `search ${all.length} pages across ${libs.length} libraries…`
                : 'loading the corpus…'}
            </Text>
          )}
        </Text>
      </Box>
      <Box flexGrow={1} paddingLeft={1}>
        <List
          rows={results.map((page) => ({
            label: `${page.lib.name.padEnd(18)} ${page.title.padEnd(28)} ${page.path}`,
          }))}
          cursor={hit}
          height={rows - 4}
        />
      </Box>
      <Box height={1} flexShrink={0}>
        <Text>
          <Text backgroundColor="green" color="black">{` C — ${variants.c} `}</Text>
          <Text dimColor>{`  ${results.length} hits · ⏎ read · ctrl+←/→ variant · esc quit`}</Text>
        </Text>
      </Box>
    </Box>
  )
}

export function run() {
  app = render(<App />, renderOptions())
  snapshotIfAsked(app)
}
