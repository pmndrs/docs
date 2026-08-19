// PROTOTYPE — throwaway. Variant B: "Two-pane reader".
//
// The premise taken spatially: libraries and pages stay on screen while you
// read. Moving the page cursor previews the page immediately, so browsing a
// library is a single continuous gesture rather than open/read/back/open.
//
// The bet: what a reader wants is context, not a sequence of decisions.

import { Box, render, Text, useInput, useWindowSize, type Instance } from 'ink'
import { spawn } from 'node:child_process'
import { useEffect, useMemo, useState } from 'react'
import { libs, pagesOf, webUrl, type Page } from './browse.prototype.corpus'
import { Lines } from './browse.prototype.lines'
import { List, moveCursor } from './browse.prototype.list'
import { renderMarkdown } from './browse.prototype.markdown'
import {
  leaveWith,
  NEXT,
  PREV,
  renderOptions,
  snapshotIfAsked,
  variants,
} from './browse.prototype.switcher'

let app: Instance

type Pane = 'libs' | 'pages' | 'content'
const panes: Pane[] = ['libs', 'pages', 'content']

function App() {
  const { columns, rows } = useWindowSize()
  const [libIndex, setLibIndex] = useState(0)
  const [pages, setPages] = useState<Page[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [pane, setPane] = useState<Pane>('pages')
  const [scroll, setScroll] = useState(0)

  const lib = libs[libIndex]
  const page = pages[pageIndex]

  useEffect(() => {
    let stale = false
    setPages([])
    setPageIndex(0)
    pagesOf(lib).then((loaded) => {
      if (!stale) setPages(loaded)
    })
    return () => {
      stale = true
    }
  }, [lib])

  useEffect(() => setScroll(0), [page])

  const sidebar = 30
  const footer = 1
  const inner = rows - footer - 2 // minus the two horizontal border rows
  const body = useMemo(
    () => (page ? renderMarkdown(page.body, columns - sidebar - 6) : []),
    [page, columns],
  )

  useInput((input, key) => {
    if (key.tab) return setPane(panes[moveCursor(panes.indexOf(pane), key.shift ? -1 : 1, 3)])
    if (input === '<') return leaveWith(app, PREV)
    if (input === '>') return leaveWith(app, NEXT)
    if (input === 'q' || (key.ctrl && input === 'c')) return leaveWith(app, 0)
    if (input === 'o' && page) {
      return void spawn('open', [webUrl(page)], { stdio: 'ignore' }).unref()
    }

    const step = key.upArrow || input === 'k' ? -1 : key.downArrow || input === 'j' ? 1 : 0
    if (!step) return
    if (pane === 'libs') setLibIndex((i) => moveCursor(i, step, libs.length))
    else if (pane === 'pages') setPageIndex((i) => moveCursor(i, step, pages.length))
    else {
      const max = Math.max(0, body.length - inner + 2)
      setScroll((s) => Math.max(0, Math.min(s + step * 3, max)))
    }
  })

  const active = (which: Pane) => (pane === which ? 'cyan' : 'gray')

  return (
    <Box flexDirection="column" width={columns} height={rows}>
      <Box flexDirection="row" flexGrow={1}>
        <Box flexDirection="column" width={sidebar} flexShrink={0}>
          <Box
            flexDirection="column"
            borderStyle="round"
            borderColor={active('libs')}
            height={libs.length + 2}
            flexShrink={0}
          >
            <List
              rows={libs.map((l) => ({ label: l.title }))}
              cursor={libIndex}
              height={libs.length}
              focused={pane === 'libs'}
            />
          </Box>
          <Box
            flexDirection="column"
            borderStyle="round"
            borderColor={active('pages')}
            flexGrow={1}
          >
            <Text wrap="truncate" color={active('pages')}>
              {` ${lib.title} · ${pages.length || '…'}`}
            </Text>
            <List
              rows={pages.map((p) => ({ label: p.title }))}
              cursor={pageIndex}
              height={inner - libs.length - 3}
              focused={pane === 'pages'}
            />
          </Box>
        </Box>

        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor={active('content')}
          flexGrow={1}
          paddingLeft={1}
          paddingRight={1}
        >
          <Text wrap="truncate" color={active('content')}>
            {page ? `${page.title}  ${page.path}` : 'loading…'}
          </Text>
          <Lines lines={body.slice(scroll, scroll + inner - 1)} />
        </Box>
      </Box>

      <Box height={1} flexShrink={0}>
        <Text>
          <Text backgroundColor="cyan" color="black">{` B — ${variants.b} `}</Text>
          <Text dimColor>{'  tab pane · ↑↓ move · o open in browser · < > variant · q quit'}</Text>
        </Text>
      </Box>
    </Box>
  )
}

export function run() {
  app = render(<App />, renderOptions())
  snapshotIfAsked(app)
}
