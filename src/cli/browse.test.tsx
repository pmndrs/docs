import { render } from 'ink-testing-library'
import { expect, test } from 'vitest'
import { Browse } from './browse'
import type { Lib, Page } from './browse.corpus'
import { resolveTarget } from './browse.target'

const lib = (name: string, title: string): Lib => ({
  name,
  title,
  description: '',
  base: `https://pmndrs.github.io/${name}`,
})

const page = (owner: Lib, path: string, title: string, body: string): Page => ({
  lib: owner,
  path,
  title,
  body,
})

const drei = lib('drei', 'Drei')
const zustand = lib('zustand', 'Zustand')

const pages = [
  page(drei, '/performances/instances', 'Instances', '# Instances\n\nDraw thousands at once.'),
  page(drei, '/controls/scroll-controls', 'ScrollControls', '# ScrollControls\n\nA scroll rig.'),
  page(zustand, '/reference/apis/create', 'create', '# create\n\nMakes a store.'),
]

const long = page(
  drei,
  '/misc/long',
  'Long',
  Array.from({ length: 60 }, (_, at) => `alpha-${String(at + 1).padStart(3, '0')}`).join('\n\n'),
)

const RIGHT_ARROW = `${String.fromCharCode(27)}[C`

/** Ink paints on a tick of its own; give it one. */
const painted = () => new Promise((resolve) => setTimeout(resolve, 20))

async function open(target?: string) {
  const app = render(
    <Browse pages={pages} target={target ? resolveTarget(target, pages) : undefined} />,
  )
  await painted()
  return app
}

test('opens on the first library, showing its pages and the first of them', async () => {
  const { lastFrame } = await open()

  expect(lastFrame()).toContain('Drei')
  expect(lastFrame()).toContain('ScrollControls')
  expect(lastFrame()).toContain('Draw thousands at once.')
  // Another library's pages are not in this list
  expect(lastFrame()).not.toContain('Makes a store.')
})

test('moving down the list changes what is read', async () => {
  const { lastFrame, stdin } = await open()

  stdin.write('j')
  await painted()
  expect(lastFrame()).toContain('A scroll rig.')
})

test('the right arrow changes library', async () => {
  const { lastFrame, stdin } = await open()

  stdin.write(RIGHT_ARROW)
  await painted()
  expect(lastFrame()).toContain('Makes a store.')
})

test('b folds the sidebar away, and back', async () => {
  const { lastFrame, stdin } = await open()

  stdin.write('b')
  await painted()
  expect(lastFrame()).not.toContain('ScrollControls')

  stdin.write('b')
  await painted()
  expect(lastFrame()).toContain('ScrollControls')
})

test('/ searches every library at once', async () => {
  const { lastFrame, stdin } = await open()

  stdin.write('/')
  await painted()
  stdin.write('create')
  await painted()

  expect(lastFrame()).toContain('zustand')
  expect(lastFrame()).toContain('Makes a store.')
})

test('⏎ hands the arrows to the page, esc hands them back', async () => {
  const app = render(<Browse pages={[long, pages[0]]} />)
  await painted()

  expect(app.lastFrame()).toContain('alpha-001')

  // Reading: the arrows scroll rather than move down the list
  app.stdin.write(String.fromCharCode(13))
  await painted()
  app.stdin.write('j')
  await painted()
  expect(app.lastFrame()).not.toContain('alpha-001')
  expect(app.lastFrame()).toContain('Long')

  // Picking again: the same arrow changes page
  app.stdin.write(String.fromCharCode(27))
  await painted()
  app.stdin.write('j')
  await painted()
  expect(app.lastFrame()).toContain('Draw thousands at once.')
})

test('tab moves the focus either way', async () => {
  const app = render(<Browse pages={[long, pages[0]]} />)
  await painted()

  app.stdin.write(String.fromCharCode(9))
  await painted()
  app.stdin.write('j')
  await painted()
  expect(app.lastFrame()).not.toContain('alpha-001')

  app.stdin.write(String.fromCharCode(9))
  await painted()
  app.stdin.write('j')
  await painted()
  expect(app.lastFrame()).toContain('Draw thousands at once.')
})

/** Where the pointer is, as the terminal reports it: SGR, and counting from 1. */
const click = (column: number, row: number) =>
  `${String.fromCharCode(27)}[<0;${column + 1};${row + 1}M`
const wheel = (direction: 'up' | 'down', column: number) =>
  `${String.fromCharCode(27)}[<${direction === 'up' ? 64 : 65};${column + 1};3M`

test('clicking a page in the list reads it', async () => {
  const { lastFrame, stdin } = await open()

  // The list opens under the sidebar's border and its title, so its first row is the third
  stdin.write(click(4, 3))
  await painted()
  expect(lastFrame()).toContain('A scroll rig.')
})

test('clicking past the last page changes nothing', async () => {
  const { lastFrame, stdin } = await open()

  stdin.write(click(4, 20))
  await painted()
  expect(lastFrame()).toContain('Draw thousands at once.')
})

test('the wheel turns whichever pane it sits over', async () => {
  const app = render(<Browse pages={[long, pages[0]]} />)
  await painted()

  // Over the page: it scrolls, whatever the focus is
  app.stdin.write(wheel('down', 60))
  await painted()
  expect(app.lastFrame()).not.toContain('alpha-001')

  app.stdin.write(wheel('up', 60))
  await painted()
  expect(app.lastFrame()).toContain('alpha-001')

  // Over the list: it moves down it
  app.stdin.write(wheel('down', 4))
  await painted()
  expect(app.lastFrame()).toContain('Draw thousands at once.')
})

test('clicking a hit leaves the search on it, in its own library', async () => {
  const { lastFrame, stdin } = await open()

  stdin.write('/')
  await painted()
  stdin.write('create')
  await painted()
  stdin.write(click(4, 2))
  await painted()

  expect(lastFrame()).toContain('Makes a store.')
  // The search is over: the sidebar is back to the library the hit lives in
  expect(lastFrame()).toContain('Zustand')
})

test('a page named on the command line is the one it opens', async () => {
  const { lastFrame } = await open('drei/controls/scroll-controls')

  expect(lastFrame()).toContain('A scroll rig.')
})

test('a query named on the command line is already typed', async () => {
  const { lastFrame } = await open('create')

  expect(lastFrame()).toContain('Makes a store.')
})
