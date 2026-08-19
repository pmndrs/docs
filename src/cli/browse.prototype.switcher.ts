// PROTOTYPE — throwaway. See browse.prototype.tsx.
//
// The variant registry, kept apart from the entry point: the entry runs on
// import (it is the CLI), so a variant importing it would boot a second copy.

export const variants = {
  a: 'Selects + pager',
  b: 'Two-pane reader',
  c: 'Palette (search-first)',
} as const

export type VariantKey = keyof typeof variants
export const keys = Object.keys(variants) as VariantKey[]

// Exit codes a variant uses to ask the supervisor for another one.
export const PREV = 10
export const NEXT = 11

export function switcherLine(current: VariantKey): string {
  const label = `${current.toUpperCase()} — ${variants[current]}`
  return `\x1b[7m ◀ < \x1b[0m \x1b[1m${label}\x1b[0m \x1b[7m > ▶ \x1b[0m  \x1b[2mvariant ${keys.indexOf(current) + 1}/${keys.length} · q to quit\x1b[0m`
}

/**
 * `--snapshot <ms>` tears the renderer down cleanly after a delay, so a run can
 * be captured (OpenTUI's frames are lost if the process just exits).
 */
export function snapshotIfAsked(renderer: { destroy(): void }) {
  const at = process.argv.indexOf('--snapshot')
  if (at === -1) return
  setTimeout(
    () => {
      renderer.destroy()
      setTimeout(() => process.exit(0), 50)
    },
    Number(process.argv[at + 1]) || 6000,
  )
}

/** `--query <text>` seeds variant C, so a search can be captured too. */
export function seededQuery(): string {
  const at = process.argv.indexOf('--query')
  return at === -1 ? '' : (process.argv[at + 1] ?? '')
}
