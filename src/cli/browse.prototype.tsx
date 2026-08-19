// PROTOTYPE — throwaway, do not merge to main.
//
//   Question: what should `pmndrs-docs browse` look like — a menu of libraries,
//   then navigation inside each library's documentation?
//
//   Three variants of that reader, switchable in place with `<` and `>`, over
//   the real corpus (react-three-fiber, drei, zustand, read from their published
//   `llms-full.txt`).
//
//     A — Selects + pager        strictly hierarchical, no chrome, ends in `less`
//     B — Two-pane reader        sidebar + content, everything visible at once
//     C — Palette                no menu at all: one fuzzy query over every page
//
//   Run it:  pnpm browse                      (starts on A)
//            pnpm browse -- -v c               (starts on C)
//            pnpm browse -- -v c --query scroll --snapshot 6000   (capturable)
//
// The switcher is the terminal equivalent of the `?variant=` bar: each variant
// is a separate process, so none of them shares a layout with the others.
//
// What running this already settled
// ---------------------------------
//   * It needs **bun**, not node. @opentui/core 0.5.4 ships an `index.node.js`
//     and per-platform native packages, but its FFI refuses to load outside
//     bun: "OpenTUI native FFI is not available for this runtime yet". So B and
//     C — and therefore this whole entry point — run under bun. An npm-shipped
//     `npx @pmndrs/docs browse` cannot use OpenTUI today without a bundled
//     standalone binary. Variant A, which needs no TUI toolkit, runs anywhere.
//   * `<select>` is never sized by flex — every one of them needs an explicit
//     `style={{ height }}`, or it renders as an empty box.
//   * Exiting straight out of a key handler drops OpenTUI's pending frame; tear
//     the renderer down and exit on a later tick (see `leave` in B and C).
//   * The registry in `src/app/page.tsx` cannot be read from a plain process:
//     it imports Next assets. `browse.prototype.corpus.ts` duplicates it.
//     A real `browse` needs it extracted to an asset-free module first.

import { spawnSync } from 'node:child_process'
import { keys, NEXT, PREV, type VariantKey } from './browse.prototype.switcher'

async function child(variant: VariantKey) {
  switch (variant) {
    case 'a':
      return (await import('./browse.prototype.variant-a')).run()
    case 'b':
      return (await import('./browse.prototype.variant-b')).run()
    case 'c':
      return (await import('./browse.prototype.variant-c')).run()
  }
}

async function supervise(start: VariantKey) {
  let index = keys.indexOf(start)
  for (;;) {
    const result = spawnSync(process.execPath, [process.argv[1], '--run', keys[index]], {
      stdio: 'inherit',
    })
    const code = result.status ?? 0
    if (code === PREV) index = (index - 1 + keys.length) % keys.length
    else if (code === NEXT) index = (index + 1) % keys.length
    else process.exit(code)
  }
}

const argv = process.argv.slice(2)
const flag = (name: string) => {
  const at = argv.findIndex((a) => a === name)
  return at === -1 ? undefined : argv[at + 1]
}

const asked = (flag('--variant') ?? flag('-v') ?? 'a').toLowerCase() as VariantKey
const running = flag('--run') as VariantKey | undefined

if (running) await child(running)
else await supervise(keys.includes(asked) ? asked : 'a')
