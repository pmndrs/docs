import { expect, test } from 'vitest'
import { plain, renderMarkdown, spanAt, toAnsi, type Line } from './browse.markdown'

const WIDTH = 80

const ESC = String.fromCharCode(27)
const BEL = String.fromCharCode(7)
const HYPERLINK = new RegExp(`${ESC}\\]8;;[^${BEL}]*${BEL}`, 'g')
const SGR = new RegExp(`${ESC}\\[[\\d;]*m`, 'g')

test('renders a heading in its own colour, over a rule', () => {
  const lines = renderMarkdown('## Getting started', WIDTH)
  const heading = lines.find((line) => line[0]?.text === 'Getting started')

  expect(heading?.[0].bold).toBe(true)
  expect(heading?.[0].fg).toBeTruthy()
  expect(plain(lines)).toContain('─'.repeat('Getting started'.length))
})

test('styles bold, italic and inline code, and drops their markers', () => {
  const lines = renderMarkdown('**loud** and _soft_ and `code()`', WIDTH)
  const spans = lines.flat()

  expect(plain(lines)).toEqual(['loud and soft and code()'])
  expect(spans.find((span) => span.text === 'loud')?.bold).toBe(true)
  expect(spans.find((span) => span.text === 'soft')?.italic).toBe(true)
  expect(spans.find((span) => span.text === 'code()')?.fg).toBeTruthy()
})

test('keeps the lines of a fenced code block verbatim', () => {
  const long = 'const positions = new Float32Array(count * 3)'
  const lines = plain(renderMarkdown(['```js', '**not bold**', '', long, '```'].join('\n'), 20))

  expect(lines.some((line) => line.endsWith('**not bold**'))).toBe(true)
  expect(lines.some((line) => line.endsWith(long))).toBe(true)
  expect(lines.some((line) => line.includes('js'))).toBe(true)
})

test('renders a list as bulleted lines', () => {
  expect(plain(renderMarkdown('- first\n- second', WIDTH))).toEqual(['  • first', '  • second'])
})

test('renders a link as its underlined label, without the URL', () => {
  const lines = renderMarkdown('see [the docs](https://docs.pmnd.rs) for more', WIDTH)

  expect(plain(lines)).toEqual(['see the docs for more'])
  expect(lines.flat().find((span) => span.underline)?.text).toBe('the docs')
})

test('a link keeps its target, resolved against the page it was written on', () => {
  const base = 'https://pmndrs.github.io/drei/performances/instances'
  const lines = renderMarkdown(
    'see [the docs](/getting-started) and [three](https://threejs.org)',
    80,
    base,
  )
  const links = lines.flat().filter((span) => span.href)

  expect(links.map((span) => span.href)).toEqual([
    'https://pmndrs.github.io/getting-started',
    'https://threejs.org/',
  ])
})

test('with no page to resolve against, only an absolute link keeps its target', () => {
  const lines = renderMarkdown('[near](/getting-started) and [far](https://threejs.org)', WIDTH)
  const spans = lines.flat()

  expect(plain(lines)).toEqual(['near and far'])
  expect(spans.find((span) => span.text === 'near')?.href).toBeUndefined()
  expect(spans.find((span) => span.text === 'far')?.href).toBe('https://threejs.org')
})

test('two links side by side stay two links', () => {
  const lines = renderMarkdown('[one](https://a.example) [two](https://b.example)', WIDTH)

  expect(lines.flat().filter((span) => span.href).length).toBe(2)
})

test('a linked span is a terminal hyperlink, printing the label alone', () => {
  const lines = renderMarkdown('see [the docs](https://docs.pmnd.rs) for more', WIDTH)
  const ansi = toAnsi(lines)

  // ESC ] 8 ; ; URL BEL label ESC ] 8 ; ; BEL -- the URL travels inside the sequence, so what
  // the terminal shows is the label, and the label is what a click follows
  expect(ansi).toContain(`${ESC}]8;;https://docs.pmnd.rs${BEL}the docs${ESC}]8;;${BEL}`)
  expect(ansi.replace(HYPERLINK, '').replace(SGR, '')).toBe('see the docs for more')
})

test('spanAt finds what sits at a column, and nothing past the end of the line', () => {
  const [line] = renderMarkdown('see [the docs](https://docs.pmnd.rs) here', WIDTH)

  expect(spanAt(line, 0)?.text).toBe('see ')
  expect(spanAt(line, 5)?.href).toBe('https://docs.pmnd.rs')
  expect(spanAt(line, 11)?.href).toBe('https://docs.pmnd.rs')
  expect(spanAt(line, 12)?.href).toBeUndefined()
  expect(spanAt(line, 999)).toBeUndefined()
})

test('renders a blockquote behind a gutter', () => {
  const lines = renderMarkdown('> mind the gap', WIDTH)

  expect(plain(lines)).toEqual(['  ▏ mind the gap'])
  expect(lines.flat().some((span) => span.italic)).toBe(true)
})

test('drops a row that is only shields.io badges', () => {
  const badges =
    '[![Version](https://img.shields.io/npm/v/three)](https://npmjs.com/three) ' +
    '[![Downloads](https://img.shields.io/npm/dt/three)](https://npmjs.com/three)'
  const lines = plain(renderMarkdown(`${badges}\n\nAfter the badges.`, WIDTH))

  expect(lines.filter((line) => line.trim())).toEqual(['After the badges.'])
})

test('collapses a multi-line <Sandpack> to a live demo marker', () => {
  const source = [
    '<Sandpack',
    '  template="react-ts"',
    '  customSetup={{',
    '    dependencies: {',
    '      three: "latest",',
    '    },',
    '  }}',
    '  folder="cards"',
    '/>',
    '',
    'After the demo.',
  ].join('\n')
  const lines = plain(renderMarkdown(source, WIDTH))

  expect(lines[0]).toContain('▶ live demo — cards')
  expect(lines[0]).toContain('[o] open in browser')
  expect(lines).toContain('After the demo.')
})

test('wraps prose to the given width, losing no word', () => {
  const prose = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor'
  const lines = plain(renderMarkdown(prose, 20))

  expect(lines.filter((line) => line.length > 20)).toEqual([])
  expect(lines.join(' ').split(/\s+/).filter(Boolean)).toEqual(prose.split(' '))
})

test('renders a code fence that never closes as code', () => {
  const lines = plain(renderMarkdown('```js\nconst a = 1', WIDTH))

  expect(lines.some((line) => line.endsWith('const a = 1'))).toBe(true)
})

test('renders a JSX element that never closes without swallowing what follows', () => {
  const lines = plain(renderMarkdown('<Sandpack folder="cards"\n\nStill here.', WIDTH))

  expect(lines).toContain('Still here.')
})

test('renders an empty document as an empty line', () => {
  expect(plain(renderMarkdown('', WIDTH))).toEqual([''])
})

test('renders at a width of zero or less, one word per line', () => {
  expect(plain(renderMarkdown('alpha beta gamma', 0))).toEqual(['alpha', 'beta', 'gamma'])
  expect(plain(renderMarkdown('alpha beta gamma', -10))).toEqual(['alpha', 'beta', 'gamma'])
})

test('renders CRLF input without carrying the carriage returns through', () => {
  const lines = plain(renderMarkdown('# Title\r\n\r\nBody text.\r\n', WIDTH))

  expect(lines).toContain('Title')
  expect(lines).toContain('Body text.')
  expect(lines.some((line) => line.includes('\r'))).toBe(false)
})

test('toAnsi wraps styled spans in escape codes and leaves plain ones alone', () => {
  const lines: Line[] = [[{ text: 'plain ' }, { text: 'loud', bold: true, fg: '#ff0000' }], []]

  expect(toAnsi(lines)).toBe(`plain \x1b[38;2;255;0;0m\x1b[1mloud\x1b[0m\n`)
})

test('toAnsi keeps the text of a colour it cannot parse', () => {
  expect(toAnsi([[{ text: 'hi', fg: 'rebeccapurple' }]])).toBe('hi')
})
