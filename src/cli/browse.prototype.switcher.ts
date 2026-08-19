// PROTOTYPE — throwaway. See browse.prototype.tsx.
//
// The variant registry, kept apart from the entry point: the entry runs on
// import (it is the CLI), so a variant importing it would boot a second copy.

import type { RenderOptions } from 'ink'
import type { Instance } from 'ink'

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
 * Leave an Ink app with an exit code the supervisor understands. `waitUntilExit`
 * settles once the unmount writes have flushed, so the terminal is restored
 * before the process goes away.
 */
export async function leaveWith(app: Instance, code: number) {
  app.unmount()
  await app.waitUntilExit()
  process.exit(code)
}

/**
 * Ink negotiates the kitty keyboard protocol with the terminal and holds input
 * until it answers — which a captured pty never does. Turn it off when a run is
 * being captured, and leave it on everywhere else.
 */
export function renderOptions(): RenderOptions {
  const capturing = process.argv.includes('--snapshot')
  return {
    exitOnCtrlC: false,
    alternateScreen: true,
    ...(capturing ? { kittyKeyboard: { mode: 'disabled' as const } } : {}),
  }
}

/**
 * `--snapshot <ms>` leaves cleanly after a delay, so a run can be captured
 * without injecting keystrokes.
 */
export function snapshotIfAsked(app: Instance) {
  const at = process.argv.indexOf('--snapshot')
  if (at === -1) return
  setTimeout(() => void leaveWith(app, 0), Number(process.argv[at + 1]) || 6000)
}

/** `--query <text>` seeds variant C, so a search can be captured too. */
export function seededQuery(): string {
  const at = process.argv.indexOf('--query')
  return at === -1 ? '' : (process.argv[at + 1] ?? '')
}

/** `--open <path>` opens variant C straight into a page, so reading can be captured. */
export function seededOpen(): string {
  const at = process.argv.indexOf('--open')
  return at === -1 ? '' : (process.argv[at + 1] ?? '')
}
