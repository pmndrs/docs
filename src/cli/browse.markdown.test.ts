import { expect, test } from 'vitest'
import { plain, renderMarkdown, toAnsi, type Line } from './browse.markdown'

const WIDTH = 80

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

test('a link carries its URL, so the terminal can open it', () => {
  const [line] = renderMarkdown('See [the docs](https://example.com/x).', 60)
  const anchor = line.find((span) => span.href)

  expect(anchor).toMatchObject({ text: 'the docs', href: 'https://example.com/x' })
  // The label is what is read; the URL costs no width
  expect(plain(renderMarkdown('See [the docs](https://example.com/x).', 60))[0]).toBe(
    'See the docs.',
  )
})

test('toAnsi emits a link as an OSC 8 hyperlink', () => {
  const ansi = toAnsi(renderMarkdown('[the docs](https://example.com/x)', 60))

  expect(ansi).toContain(`${String.fromCharCode(27)}]8;;https://example.com/x`)
  expect(ansi).toContain('the docs')
})

test('toAnsi wraps styled spans in escape codes and leaves plain ones alone', () => {
  const lines: Line[] = [[{ text: 'plain ' }, { text: 'loud', bold: true, fg: '#ff0000' }], []]

  expect(toAnsi(lines)).toBe(`plain \x1b[38;2;255;0;0m\x1b[1mloud\x1b[0m\n`)
})

test('toAnsi keeps the text of a colour it cannot parse', () => {
  expect(toAnsi([[{ text: 'hi', fg: 'rebeccapurple' }]])).toBe('hi')
})
