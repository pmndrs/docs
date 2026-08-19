// The reader: a page list on the left, the page on the right, and a search that crosses
// libraries. Ink gives the flexbox and the input; the list, the scroll and the layout are
// this file.

import { Box, Text, render, useApp, useInput, useWindowSize } from 'ink'
import { spawn } from 'node:child_process'
import { useMemo, useState } from 'react'
import { webUrl, type Lib, type Page } from './browse.corpus'
import { Lines } from './browse.lines'
import { List, moveCursor } from './browse.list'
import { renderMarkdown } from './browse.markdown'
import { search } from './browse.search'
import type { Target } from './browse.target'

const SIDEBAR_WIDTH = 34

/** Hands a URL to the desktop, and forgets about it. */
function openInBrowser(url: string) {
  const command =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
  spawn(command, [url], { stdio: 'ignore', detached: true, shell: process.platform === 'win32' })
    .on('error', () => {})
    .unref()
}

/** The libraries the corpus covers, in the order it holds them. */
function libsOf(pages: Page[]): Lib[] {
  const seen = new Map<string, Lib>()
  for (const page of pages) if (!seen.has(page.lib.name)) seen.set(page.lib.name, page.lib)
  return [...seen.values()]
}

interface Start {
  lib?: Lib
  page?: Page
  query?: string
}

/** Where the command line said to start. */
function startOf(target: Target | undefined): Start {
  if (!target) return {}
  if (target.kind === 'lib') return { lib: target.lib }
  if (target.kind === 'page') return { lib: target.page.lib, page: target.page }
  return { lib: target.lib, query: target.query }
}

export function Browse({ pages, target }: { pages: Page[]; target?: Target }) {
  const { exit } = useApp()
  const { columns, rows } = useWindowSize()
  const start = useMemo(() => startOf(target), [target])
  const libs = useMemo(() => libsOf(pages), [pages])

  const [libIndex, setLibIndex] = useState(() =>
    Math.max(
      0,
      libs.findIndex((lib) => lib.name === start.lib?.name),
    ),
  )
  const [searching, setSearching] = useState(start.query !== undefined)
  const [query, setQuery] = useState(start.query ?? '')
  // Only a query typed on the command line keeps its library scope; `/` searches everything.
  const [scope, setScope] = useState(start.query !== undefined ? start.lib : undefined)
  const [sidebar, setSidebar] = useState(true)
  // Which pane the arrows drive. A page named on the command line is one to read, not to
  // pick again, so it starts on the right.
  const [focus, setFocus] = useState<'pages' | 'page'>(start.page ? 'page' : 'pages')
  const [cursor, setCursor] = useState(0)
  const [scroll, setScroll] = useState(0)

  const listed = useMemo(() => {
    if (!searching) return pages.filter((page) => page.lib.name === libs[libIndex]?.name)
    return search(query, scope ? pages.filter((page) => page.lib.name === scope.name) : pages)
  }, [pages, libs, libIndex, searching, query, scope])

  // A page named on the command line is the one to open, wherever it sits in the list
  const [pinned, setPinned] = useState(() =>
    start.page ? listed.findIndex((page) => page.path === start.page?.path) : -1,
  )
  const at = pinned >= 0 ? pinned : cursor
  const current = listed[Math.min(at, Math.max(0, listed.length - 1))]

  const contentWidth = (sidebar ? columns - SIDEBAR_WIDTH : columns) - 4
  const body = useMemo(
    () => (current ? renderMarkdown(current.body, Math.max(1, Math.min(contentWidth, 100))) : []),
    [current, contentWidth],
  )

  const viewport = Math.max(1, rows - 4)
  const maxScroll = Math.max(0, body.length - viewport)

  // With no sidebar there is no list to drive, whatever the focus was before it was folded
  const reading = focus === 'page' || !sidebar

  const show = (index: number) => {
    setPinned(-1)
    setCursor(index)
    setScroll(0)
  }

  const scrollBy = (delta: number) =>
    setScroll((was) => Math.max(0, Math.min(was + delta, maxScroll)))

  useInput((input, key) => {
    if (key.ctrl && input === 'c') return exit()

    if (searching) {
      if (key.escape) {
        setSearching(false)
        setScope(undefined)
        return show(0)
      }
      if (key.return) {
        // Land on the hit in its own library, so ↑↓ carries on from there
        if (!current) return
        setSearching(false)
        setScope(undefined)
        const index = libs.findIndex((lib) => lib.name === current.lib.name)
        const inLib = pages.filter((page) => page.lib.name === current.lib.name)
        setLibIndex(index < 0 ? 0 : index)
        // Someone who searched wants to read what they found
        setFocus('page')
        return show(inLib.findIndex((page) => page.path === current.path))
      }
      if (key.upArrow) return show(moveCursor(at, -1, listed.length))
      if (key.downArrow) return show(moveCursor(at, 1, listed.length))
      if (key.backspace || key.delete) {
        setQuery((was) => was.slice(0, -1))
        return show(0)
      }
      if (input && !key.ctrl && !key.meta && input >= ' ') {
        setQuery((was) => was + input)
        return show(0)
      }
      return
    }

    if (input === 'q') return exit()
    if (input === '/') {
      setSearching(true)
      setQuery('')
      setScope(undefined)
      setFocus('pages')
      return show(0)
    }
    if (input === 'b') {
      setSidebar((was) => !was)
      return setFocus('pages')
    }
    if (input === 'o') return current && openInBrowser(webUrl(current))

    // Picking a page and reading it are two jobs for one pair of arrow keys, so the arrows
    // belong to whichever pane has the focus. ⏎ hands it over, esc hands it back, tab does
    // either -- and the borders say where it is.
    if (key.tab) return setFocus(reading ? 'pages' : 'page')
    if (key.return) return setFocus('page')
    if (key.escape) return setFocus('pages')

    if (key.pageDown || input === ' ') return scrollBy(viewport - 1)
    if (key.pageUp) return scrollBy(-(viewport - 1))

    if (key.leftArrow || input === 'h') {
      setLibIndex((was) => moveCursor(was, -1, libs.length))
      setFocus('pages')
      return show(0)
    }
    if (key.rightArrow || input === 'l') {
      setLibIndex((was) => moveCursor(was, 1, libs.length))
      setFocus('pages')
      return show(0)
    }

    const step = key.upArrow || input === 'k' ? -1 : key.downArrow || input === 'j' ? 1 : 0
    if (!step) return
    if (reading) return scrollBy(step * 3)
    show(moveCursor(at, step, listed.length))
  })

  const hints = searching
    ? '⏎ open · ↑↓ hits · esc back'
    : reading
      ? `↑↓ scroll${sidebar ? ' · esc/⇥ pages' : ''} · ←→ library · b ${sidebar ? 'hide' : 'show'} sidebar · / search · o browser · q quit`
      : '↑↓ pages · ⏎/⇥ read · ←→ library · b hide sidebar · / search · o browser · q quit'

  return (
    <Box flexDirection="column" width={columns} height={rows}>
      <Box flexGrow={1}>
        {sidebar && (
          <Box
            flexDirection="column"
            width={SIDEBAR_WIDTH}
            flexShrink={0}
            borderStyle="round"
            borderColor={searching ? 'green' : reading ? 'gray' : 'cyan'}
            paddingX={1}
          >
            <Text wrap="truncate" color={searching ? 'green' : 'cyan'} bold>
              {searching ? `❯ ${query}▌` : (libs[libIndex]?.title ?? 'no library')}
            </Text>
            <List
              rows={listed.map((page) => ({
                label: searching ? `${page.lib.name}  ${page.title}` : page.title,
              }))}
              cursor={at}
              height={rows - 4}
              focused={!reading}
            />
          </Box>
        )}

        <Box
          flexDirection="column"
          flexGrow={1}
          borderStyle="round"
          borderColor={reading ? 'cyan' : 'gray'}
          paddingX={1}
        >
          <Text wrap="truncate" color="cyan">
            {current ? `${current.lib.title} · ${current.path}` : 'nothing to read'}
          </Text>
          <Lines lines={body.slice(scroll, scroll + viewport)} />
        </Box>
      </Box>

      <Box height={1} flexShrink={0}>
        <Text dimColor wrap="truncate">
          {` ${listed.length} pages · ${hints}`}
        </Text>
      </Box>
    </Box>
  )
}

/** Runs the reader on the alternate screen, so the terminal comes back as it was. */
export async function browse(pages: Page[], target?: Target) {
  process.stdout.write('\x1b[?1049h')
  try {
    await render(<Browse pages={pages} target={target} />).waitUntilExit()
  } finally {
    process.stdout.write('\x1b[?1049l')
  }
}
