// PROTOTYPE — throwaway. See browse.prototype.tsx.
//
// pmndrs-flavored MDX -> styled lines. Deliberately a line/span model rather
// than an ANSI string: variant A prints ANSI to a pager, variants B and C hand
// the same lines to OpenTUI's <text>/<span>. This module is the one piece all
// three share, and the one piece a real `browse` would have to get right.

export interface Span {
  text: string
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

// `[![badge](img)](href)` — the shields.io rows that open half the pmndrs pages.
const BADGE_ONLY = /^\s*(\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)\s*)+$/

function inline(text: string): Span[] {
  const spans: Span[] = []
  // One pass over `code`, [label](href), **bold**, _em_.
  const token = /(`[^`]+`)|(\[([^\]]*)\]\(([^)]+)\))|(\*\*[^*]+\*\*)|(_[^_]+_)/g
  let last = 0
  for (const match of text.matchAll(token)) {
    const at = match.index!
    if (at > last) spans.push({ text: text.slice(last, at) })
    if (match[1]) spans.push({ text: match[1].slice(1, -1), fg: theme.code })
    else if (match[2]) {
      spans.push({ text: match[3] || match[4], fg: theme.link, underline: true })
    } else if (match[5]) spans.push({ text: match[5].slice(2, -2), bold: true })
    else if (match[6]) spans.push({ text: match[6].slice(1, -1), italic: true })
    last = at + match[0].length
  }
  if (last < text.length) spans.push({ text: text.slice(last) })
  return spans.length ? spans : [{ text }]
}

const sameStyle = (a: Span, b: Span) =>
  a.fg === b.fg &&
  !!a.bold === !!b.bold &&
  !!a.dim === !!b.dim &&
  !!a.italic === !!b.italic &&
  !!a.underline === !!b.underline

/** Word-wrap, merging neighbouring words that share a style into one span. */
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

export function renderMarkdown(body: string, width: number): Line[] {
  const out: Line[] = []
  const source = body
    // The dump prefixes each page with its own URL/Description header.
    .replace(/^URL:.*\n(Description:.*\n)?/, '')
    .split('\n')

  let i = 0
  while (i < source.length) {
    const line = source[i]

    // Fenced code: kept verbatim, gutter-marked.
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      out.push([
        { text: '  ┌─ ', fg: theme.marker },
        { text: lang || 'code', fg: theme.marker },
      ])
      i++
      while (i < source.length && !source[i].startsWith('```')) {
        out.push([
          { text: '  │ ', fg: theme.marker },
          { text: source[i], fg: theme.code },
        ])
        i++
      }
      out.push([{ text: '  └─', fg: theme.marker }])
      i++
      continue
    }

    // <Sandpack …/> — the live r3f demo. It has no terminal form, so it
    // collapses to a marker. THIS is the design question a reader has to answer.
    if (line.trimStart().startsWith('<Sandpack')) {
      let depth = 0
      const start = i
      do {
        depth += (source[i].match(/[[{(]/g) ?? []).length
        depth -= (source[i].match(/[\]})]/g) ?? []).length
        i++
      } while (i < source.length && (depth > 0 || !source[i - 1].trimEnd().endsWith('/>')))
      const folder = source
        .slice(start, i)
        .join(' ')
        .match(/folder="([^"]*)"/)?.[1]
      out.push([
        { text: '  ▶ live demo', fg: theme.demo, bold: true },
        { text: folder ? ` — ${folder}` : '', fg: theme.demo },
        { text: '   [o] open in browser', fg: theme.marker },
      ])
      continue
    }

    // Headings.
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

    if (BADGE_ONLY.test(line)) {
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
      out.push(...wrap(inline(bullet[2]), width, `${bullet[1]}  • `))
      i++
      continue
    }

    // Bare JSX (<Intro>, <Grid cols={2}>, <details>…) — shown dim, not hidden,
    // so it is obvious what the terminal is dropping.
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

    out.push(...wrap(inline(line), width))
    i++
  }

  return out
}

const RESET = '\x1b[0m'

function ansi(span: Span): string {
  let codes = ''
  if (span.fg) {
    const [, r, g, b] = span.fg.match(/#(..)(..)(..)/)!
    codes += `\x1b[38;2;${parseInt(r, 16)};${parseInt(g, 16)};${parseInt(b, 16)}m`
  }
  if (span.bold) codes += '\x1b[1m'
  if (span.dim) codes += '\x1b[2m'
  if (span.italic) codes += '\x1b[3m'
  if (span.underline) codes += '\x1b[4m'
  return codes ? codes + span.text + RESET : span.text
}

export function toAnsi(lines: Line[]): string {
  return lines.map((line) => line.map(ansi).join('')).join('\n')
}

export function plain(lines: Line[]): string[] {
  return lines.map((line) => line.map((span) => span.text).join(''))
}
