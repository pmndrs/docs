// PROTOTYPE — throwaway. Variant A: "Selects + pager".
//
// The premise taken literally, and nothing more: a menu of libraries, then a
// menu of pages, then the page in `less -R`. No full-screen app, no layout to
// invent, no scroll/search to reimplement — the pager already has all of it,
// and everyone already knows its keys.
//
// The bet: `browse` does not need a TUI at all.

import { spawnSync } from 'node:child_process'
import { emitKeypressEvents } from 'node:readline'
import { libs, pagesOf, webUrl, type Lib, type Page } from './browse.prototype.corpus'
import { renderMarkdown, toAnsi } from './browse.prototype.markdown'
import { NEXT, PREV, switcherLine } from './browse.prototype.switcher'

interface Choice {
  label: string
  hint?: string
}

const CLEAR = '\x1b[2J\x1b[H'

/**
 * An arrow-key list. Resolves the picked index, or a sentinel: `back`, `quit`,
 * `prev`/`next` for the variant switcher.
 */
function select(
  title: string,
  choices: Choice[],
  { back }: { back?: string } = {},
): Promise<number | 'back' | 'quit' | 'prev' | 'next'> {
  return new Promise((resolve) => {
    let cursor = 0

    const draw = () => {
      const out = [CLEAR, switcherLine('a'), '', `\x1b[1m${title}\x1b[0m`, '']
      choices.forEach((choice, i) => {
        const on = i === cursor
        const bullet = on ? '\x1b[36m❯\x1b[0m' : ' '
        const label = on ? `\x1b[36m${choice.label}\x1b[0m` : choice.label
        out.push(`  ${bullet} ${label}${choice.hint ? `  \x1b[2m${choice.hint}\x1b[0m` : ''}`)
      })
      out.push('', `\x1b[2m↑↓ move · ⏎ open${back ? ` · esc ${back}` : ''} · q quit\x1b[0m`)
      process.stdout.write(out.join('\n'))
    }

    emitKeypressEvents(process.stdin)
    if (process.stdin.isTTY) process.stdin.setRawMode(true)
    process.stdin.resume()

    const onKey = (_: string, key: { name?: string; ctrl?: boolean; sequence?: string }) => {
      if (key.name === 'up' || key.name === 'k')
        cursor = (cursor - 1 + choices.length) % choices.length
      else if (key.name === 'down' || key.name === 'j') cursor = (cursor + 1) % choices.length
      else if (key.name === 'return') return done(cursor)
      else if (key.name === 'escape' && back) return done('back')
      else if (key.name === 'q' || (key.ctrl && key.name === 'c')) return done('quit')
      else if (key.sequence === '<') return done('prev')
      else if (key.sequence === '>') return done('next')
      draw()
    }

    const done = (value: number | 'back' | 'quit' | 'prev' | 'next') => {
      process.stdin.off('keypress', onKey)
      if (process.stdin.isTTY) process.stdin.setRawMode(false)
      process.stdin.pause()
      resolve(value)
    }

    process.stdin.on('keypress', onKey)
    draw()
  })
}

function page(chosen: Page) {
  const width = Math.min((process.stdout.columns ?? 80) - 4, 96)
  const header = [
    `\x1b[1m${chosen.lib.title}\x1b[0m \x1b[2m${chosen.path}\x1b[0m`,
    `\x1b[2m${webUrl(chosen)}\x1b[0m`,
    '',
  ].join('\n')
  const body = toAnsi(renderMarkdown(chosen.body, width))
  spawnSync('less', ['-R', '-S'], {
    input: `${header}${body}\n`,
    stdio: ['pipe', 'inherit', 'inherit'],
  })
}

export async function run() {
  let lib: Lib | undefined

  for (;;) {
    if (!lib) {
      const picked = await select(
        'Which library?',
        libs.map((l) => ({ label: l.title, hint: l.description })),
      )
      if (picked === 'quit') return process.exit(0)
      if (picked === 'prev') return process.exit(PREV)
      if (picked === 'next') return process.exit(NEXT)
      if (picked === 'back') continue
      lib = libs[picked]
    }

    process.stdout.write(`${CLEAR}\x1b[2mfetching ${lib.title}…\x1b[0m`)
    const pages = await pagesOf(lib)

    const picked = await select(
      `${lib.title} — ${pages.length} pages`,
      pages.map((p) => ({ label: p.title, hint: p.path })),
      { back: 'libraries' },
    )
    if (picked === 'quit') return process.exit(0)
    if (picked === 'prev') return process.exit(PREV)
    if (picked === 'next') return process.exit(NEXT)
    if (picked === 'back') {
      lib = undefined
      continue
    }
    page(pages[picked])
  }
}
