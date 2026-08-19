// pmndrs-flavored MDX -> styled lines.
//
// The model is lines of styled spans rather than one ANSI string, because the same render has
// two destinations: `toAnsi` for a pager, and Ink's `<Text>` for the interactive reader.
//
// Nothing here parses MDX. It recognizes, line by line, the constructs the pmndrs docs
// actually use, and shows whatever it does not recognize as the text it was — so a page that
// uses something new degrades to plain prose instead of disappearing.

export interface Span {
  text: string
  /** Where the span points, absolute. A link, and nothing else, has one. */
  href?: string
  fg?: string
  bold?: boolean
  dim?: boolean
  italic?: boolean
  underline?: boolean
}

export type Line = Span[]

const theme = {
  h1: '#ff6b9d',
  h2: '#c792ea',
  h3: '#82aaff',
  code: '#ffcb6b',
  link: '#89ddff',
  quote: '#a0a0a0',
  marker: '#5a5a5a',
  demo: '#c3e88d',
}

/** `[![badge](img)](href)` rows — the shields.io strip that opens half the pmndrs pages. */
const BADGE_ROW = /^\s*(\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)\s*)+$/

/** Inline `code`, [label](href), **bold** and _emphasis_, in one left-to-right pass. */
const INLINE_TOKEN = /(`[^`]+`)|(\[([^\]]*)\]\(([^)]+)\))|(\*\*[^*]+\*\*)|(_[^_]+_)/g

/**
 * A link's target as a browser can follow it.
 *
 * Docs link to each other with a path (`/getting-started/introduction`), which only means
 * something next to the page it was written on -- so a link is worth keeping only when there
 * is a page to resolve it against.
 */
function resolve(href: string, base: string | undefined): string | undefined {
  if (!base) return /^[a-z][\w+.-]*:/i.test(href) ? href : undefined
  try {
    return new URL(href, base).href
  } catch {
    return undefined
  }
}

function inline(text: string, base?: string): Span[] {
  const spans: Span[] = []
  let last = 0

  for (const match of text.matchAll(INLINE_TOKEN)) {
    const at = match.index ?? 0
    if (at > last) spans.push({ text: text.slice(last, at) })

    if (match[1]) spans.push({ text: match[1].slice(1, -1), fg: theme.code })
    // A link keeps its label, or its href when it has no label: spelling the URL out next to
    // the label costs more width than it is worth, and the href travels with the span anyway
    else if (match[2])
      spans.push({
        text: match[3] || match[4],
        href: resolve(match[4], base),
        fg: theme.link,
        underline: true,
      })
    else if (match[5]) spans.push({ text: match[5].slice(2, -2), bold: true })
    else if (match[6]) spans.push({ text: match[6].slice(1, -1), italic: true })

    last = at + match[0].length
  }

  if (last < text.length) spans.push({ text: text.slice(last) })
  return spans.length ? spans : [{ text }]
}

const sameStyle = (a: Span, b: Span) =>
  a.href === b.href &&
  a.fg === b.fg &&
  !!a.bold === !!b.bold &&
  !!a.dim === !!b.dim &&
  !!a.italic === !!b.italic &&
  !!a.underline === !!b.underline

/**
 * Word-wraps `spans`, merging neighbouring words that share a style back into one span.
 *
 * `indent` opens every line, continuations included, which is what gives a bullet or a quote
 * its hanging margin. A word longer than the width is left whole on its own line: breaking an
 * identifier or a URL mid-way costs more than the overflow does.
 */
function wrap(spans: Span[], width: number, indent = ''): Line[] {
  const lines: Line[] = []
  let current: Line = indent ? [{ text: indent }] : []
  let used = indent.length

  const push = (span: Span) => {
    const last = current[current.length - 1]
    if (last && sameStyle(last, span)) last.text += span.text
    else current.push({ ...span })
  }

  for (const span of spans) {
    for (const word of span.text.split(/(\s+)/)) {
      if (!word) continue
      if (used + word.length > width && used > indent.length) {
        lines.push(current)
        current = indent ? [{ text: indent }] : []
        used = indent.length
        if (/^\s+$/.test(word)) continue
      }
      push({ ...span, text: word })
      used += word.length
    }
  }

  if (current.length) lines.push(current)
  return lines.length ? lines : [[{ text: '' }]]
}

const count = (line: string, pattern: RegExp) => (line.match(pattern) ?? []).length

/** Index of the closing fence, or the end of the source when the fence never closes. */
function closingFence(source: string[], start: number): number {
  for (let i = start + 1; i < source.length; i++) {
    if (source[i].startsWith('```')) return i
  }
  return source.length
}

/**
 * Index just past the JSX element opened at `start`.
 *
 * `<Sandpack>` carries multi-line `customSetup`/`files` props, so the element ends at the
 * first `/>` reached with every bracket it opened closed again — not at the end of its
 * opening line. An element that never closes counts as its opening line alone, so a
 * truncated page loses that line rather than everything below it.
 */
function endOfElement(source: string[], start: number): number {
  let depth = 0
  for (let i = start; i < source.length; i++) {
    depth += count(source[i], /[[{(]/g) - count(source[i], /[\]})]/g)
    if (depth <= 0 && source[i].trimEnd().endsWith('/>')) return i + 1
  }
  return start + 1
}

/** A live demo has no terminal form, so it collapses to a marker the reader can act on. */
function demoMarker(folder: string | undefined): Line {
  const line: Line = [{ text: '  ▶ live demo', fg: theme.demo, bold: true }]
  if (folder) line.push({ text: ` — ${folder}`, fg: theme.demo })
  line.push({ text: '   [o] open in browser', fg: theme.marker })
  return line
}

function renderBlocks(source: string[], width: number, base?: string): Line[] {
  const out: Line[] = []
  let i = 0

  while (i < source.length) {
    const line = source[i]

    // Fenced code: kept verbatim, gutter-marked. No wrapping, no inline styling — the point
    // of a code block is that what is printed is what can be pasted.
    if (line.startsWith('```')) {
      const close = closingFence(source, i)
      const lang = line.slice(3).trim()
      out.push([
        { text: '  ┌─ ', fg: theme.marker },
        { text: lang || 'code', fg: theme.marker },
      ])
      for (const code of source.slice(i + 1, close)) {
        out.push([
          { text: '  │ ', fg: theme.marker },
          { text: code, fg: theme.code },
        ])
      }
      out.push([{ text: '  └─', fg: theme.marker }])
      i = close + 1
      continue
    }

    if (line.trimStart().startsWith('<Sandpack')) {
      const end = endOfElement(source, i)
      const folder = source
        .slice(i, end)
        .join(' ')
        .match(/folder="([^"]*)"/)?.[1]
      out.push(demoMarker(folder))
      i = end
      continue
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/)
    if (heading) {
      const level = heading[1].length
      const fg = level === 1 ? theme.h1 : level === 2 ? theme.h2 : theme.h3
      out.push([])
      out.push([{ text: heading[2], fg, bold: true }])
      if (level <= 2) out.push([{ text: '─'.repeat(Math.min(width, heading[2].length)), fg }])
      i++
      continue
    }

    if (BADGE_ROW.test(line)) {
      i++
      continue
    }

    if (line.startsWith('> ')) {
      out.push(...wrap([{ text: line.slice(2), fg: theme.quote, italic: true }], width, '  ▏ '))
      i++
      continue
    }

    const bullet = line.match(/^(\s*)[-*]\s+(.*)$/)
    if (bullet) {
      out.push(...wrap(inline(bullet[2], base), width, `${bullet[1]}  • `))
      i++
      continue
    }

    // Bare JSX (<Intro>, <Grid cols={2}>, <details>…) is dimmed rather than hidden, so it is
    // obvious what the terminal is dropping.
    if (/^\s*<\/?[A-Za-z]/.test(line)) {
      out.push([{ text: line.trim(), fg: theme.marker, dim: true }])
      i++
      continue
    }

    if (!line.trim()) {
      out.push([])
      i++
      continue
    }

    out.push(...wrap(inline(line, base), width))
    i++
  }

  return out
}

/**
 * Renders one markdown body to styled lines, wrapped to `width` columns.
 *
 * `base` is the URL the body was published at, and it is what turns the relative links a page
 * makes to its neighbours into links something can follow. Without it, only the absolute ones
 * survive as links.
 *
 * Never throws: any input renders, and anything malformed degrades to the plain text it was
 * written as. A reader is not allowed to die on a page.
 */
export function renderMarkdown(body: string, width: number, base?: string): Line[] {
  const source = String(body ?? '')
    .replace(/\r\n?/g, '\n')
    // Pages come out of the corpus behind their own `URL:`/`Description:` header.
    .replace(/^URL:.*\n(Description:.*\n)?/, '')
    .split('\n')

  // A terminal reports a width of 0 when it cannot measure itself (piped, detached); one
  // column still renders, one word per line.
  const columns = Number.isFinite(width) && width >= 1 ? Math.floor(width) : 1

  try {
    return renderBlocks(source, columns, base)
  } catch {
    return source.map((line) => [{ text: line }])
  }
}

/**
 * The span covering `column`, counting from the start of the line, or nothing past its end.
 *
 * This is how a pointer lands on a word: the reader knows where a line starts on screen, and
 * the line knows what sits at each of its columns.
 */
export function spanAt(line: Line, column: number): Span | undefined {
  let at = 0
  for (const span of line) {
    at += span.text.length
    if (column < at) return span
  }
  return undefined
}

const RESET = '\x1b[0m'
const HEX = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i

const OSC = '\x1b]8;;'
const BEL = '\x07'

/**
 * Marks `text` as a link to `href`, the way OSC 8 does.
 *
 * The terminal is what makes it clickable, so this costs no width, no key and no code: a
 * terminal that speaks OSC 8 underlines the label and opens the URL on a click, and one that
 * does not prints the label alone. Ink passes the sequence through untouched, and measures
 * the text as if it were not there.
 */
export function hyperlink(text: string, href: string): string {
  return `${OSC}${href}${BEL}${text}${OSC}${BEL}`
}

function ansi(span: Span): string {
  let codes = ''

  const rgb = span.fg?.match(HEX)
  if (rgb) {
    const [r, g, b] = rgb.slice(1).map((channel) => parseInt(channel, 16))
    codes += `\x1b[38;2;${r};${g};${b}m`
  }
  if (span.bold) codes += '\x1b[1m'
  if (span.dim) codes += '\x1b[2m'
  if (span.italic) codes += '\x1b[3m'
  if (span.underline) codes += '\x1b[4m'

  const text = span.href ? hyperlink(span.text, span.href) : span.text
  return codes ? codes + text + RESET : text
}

/** Serializes lines to one ANSI string, for a pager or a plain `stdout` write. */
export function toAnsi(lines: Line[]): string {
  return lines.map((line) => line.map(ansi).join('')).join('\n')
}

/** The same lines with every style dropped — what a test asserts on, and what `--no-color` prints. */
export function plain(lines: Line[]): string[] {
  return lines.map((line) => line.map((span) => span.text).join(''))
}
