// The terminal has a pointer; Ink does not know it. Asking for SGR mouse reporting makes the
// terminal send one CSI sequence per click and per wheel notch, and Ink hands each of them to
// `useInput` whole, with its ESC already stripped -- so reading the pointer is reading a
// string, and the reader needs no second listener on stdin.

/** Turns click and wheel reporting on. SGR (1006) is what lifts the 223-column limit. */
export const MOUSE_ON = '\x1b[?1000h\x1b[?1006h'

/** And off again -- left set, the terminal keeps reporting into whatever runs next. */
export const MOUSE_OFF = '\x1b[?1006l\x1b[?1000l'

export interface Mouse {
  kind: 'click' | 'wheel-up' | 'wheel-down'
  /** Both 0-based, from the top-left corner of the terminal, as Ink lays it out. */
  column: number
  row: number
}

/** `[<button;column;rowM` — a press, or `m`, its release. Columns and rows count from 1. */
const SGR_MOUSE = /^\[<(\d+);(\d+);(\d+)([Mm])$/

/** Modifiers ride in bits 2-4 of the button, and say nothing about where the pointer is. */
const BUTTON = 0b1000011

/** Bit 5 marks a move rather than a press -- a drag has nothing here to drag. */
const MOTION = 0b100000

/**
 * The pointer event `input` carries, or nothing when it carries none.
 *
 * Only what the reader acts on comes back: the press of the left button, and the wheel. A
 * release repeats the press that it ends, and a drag would move a cursor with nothing to drag.
 */
export function parseMouse(input: string): Mouse | undefined {
  const match = input.match(SGR_MOUSE)
  if (!match) return undefined

  // A wheel notch reports as a press with no release, so acting on presses alone still counts
  // every notch -- and counts a click once rather than twice.
  if (match[4] !== 'M') return undefined

  if (Number(match[1]) & MOTION) return undefined

  const button = Number(match[1]) & BUTTON
  const kind =
    button === 64 ? 'wheel-up' : button === 65 ? 'wheel-down' : button === 0 ? 'click' : undefined
  if (!kind) return undefined

  return { kind, column: Number(match[2]) - 1, row: Number(match[3]) - 1 }
}
