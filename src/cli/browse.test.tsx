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

test('a page named on the command line is the one it opens', async () => {
  const { lastFrame } = await open('drei/controls/scroll-controls')

  expect(lastFrame()).toContain('A scroll rig.')
})

test('a query named on the command line is already typed', async () => {
  const { lastFrame } = await open('create')

  expect(lastFrame()).toContain('Makes a store.')
})
