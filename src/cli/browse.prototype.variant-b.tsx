// PROTOTYPE — throwaway. Variant B: "Two-pane reader".
//
// The premise taken spatially: libraries and pages stay on screen while you
// read. Moving the page cursor previews the page immediately, so browsing a
// library is a single continuous gesture rather than open/read/back/open.
//
// The bet: what a reader wants is context, not a sequence of decisions.

import { createCliRenderer, type CliRenderer, type SelectOption } from '@opentui/core'
import { createRoot, useKeyboard, useTerminalDimensions } from '@opentui/react'
import { spawn } from 'node:child_process'
import { useEffect, useMemo, useState } from 'react'
import { NEXT, PREV, snapshotIfAsked, variants } from './browse.prototype.switcher'
import { libs, pagesOf, webUrl, type Page } from './browse.prototype.corpus'
import { Lines } from './browse.prototype.lines'
import { renderMarkdown } from './browse.prototype.markdown'

let renderer: CliRenderer

function leave(code: number) {
  // Exiting straight out of a key handler cuts OpenTUI's pending write and
  // leaves the terminal mid-frame. Tear down, then exit on the next tick.
  renderer.destroy()
  setTimeout(() => process.exit(code), 50)
}

type Pane = 'libs' | 'pages' | 'content'
const panes: Pane[] = ['libs', 'pages', 'content']

function App() {
  const { width, height } = useTerminalDimensions()
  const [libIndex, setLibIndex] = useState(0)
  const [pages, setPages] = useState<Page[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [pane, setPane] = useState<Pane>('pages')

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

  // <select> is not sized by flex — every one of them needs an explicit height.
  const sidebar = 30
  const footer = 1
  const libsBox = libs.length + 2
  const pagesBox = height - footer - libsBox
  const body = useMemo(
    () => (page ? renderMarkdown(page.body, width - sidebar - 6) : []),
    [page, width, sidebar],
  )

  useKeyboard((key) => {
    if (key.name === 'tab') setPane(panes[(panes.indexOf(pane) + (key.shift ? -1 : 1) + 3) % 3])
    else if (key.sequence === '<') leave(PREV)
    else if (key.sequence === '>') leave(NEXT)
    else if (key.name === 'q' || (key.ctrl && key.name === 'c')) leave(0)
    else if (key.name === 'o' && page) spawn('open', [webUrl(page)], { stdio: 'ignore' }).unref()
  })

  const libOptions: SelectOption[] = libs.map((l) => ({
    name: l.title,
    description: l.description,
    value: l.name,
  }))
  const pageOptions: SelectOption[] = pages.map((p) => ({
    name: p.title,
    description: p.path,
    value: p.path,
  }))

  return (
    <box style={{ flexDirection: 'column', width, height }}>
      <box style={{ flexDirection: 'row', flexGrow: 1 }}>
        <box style={{ flexDirection: 'column', width: sidebar }}>
          <box
            title="Libraries"
            titleColor={pane === 'libs' ? '#89ddff' : '#5a5a5a'}
            style={{ border: true, height: libsBox }}
          >
            <select
              style={{ height: libs.length }}
              showDescription={false}
              options={libOptions}
              focused={pane === 'libs'}
              onChange={(index) => setLibIndex(index)}
            />
          </box>
          <box
            title={`${lib.title} · ${pages.length || '…'}`}
            titleColor={pane === 'pages' ? '#89ddff' : '#5a5a5a'}
            style={{ border: true, height: pagesBox }}
          >
            <select
              style={{ height: pagesBox - 2 }}
              showDescription={false}
              options={pageOptions}
              focused={pane === 'pages'}
              onChange={(index) => setPageIndex(index)}
            />
          </box>
        </box>

        <box
          title={page ? `${page.title}  ${page.path}` : 'loading…'}
          titleColor={pane === 'content' ? '#89ddff' : '#5a5a5a'}
          style={{ border: true, flexGrow: 1 }}
        >
          <scrollbox focused={pane === 'content'} style={{ paddingLeft: 1, paddingRight: 1 }}>
            <Lines lines={body} />
          </scrollbox>
        </box>
      </box>

      <box style={{ height: 1, paddingLeft: 1 }}>
        <text>
          <span fg="#1a1b26" bg="#89ddff">
            {` B — ${variants.b} `}
          </span>
          <span fg="#5a5a5a">
            {'  tab pane · ↑↓ move · o open in browser · < > variant · q quit'}
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
