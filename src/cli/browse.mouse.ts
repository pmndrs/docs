// The wheel, so the pane under the pointer is the one that moves. A terminal only reports it
// once asked, and reports it as an escape sequence -- `\x1b[<button;column;rowM` in the SGR
// encoding every terminal worth the name understands.

/** Asks the terminal for wheel reports. It stops selecting text on its own in exchange. */
export const WHEEL_ON = '\x1b[?1000h\x1b[?1006h'
/** Hands the wheel back to the terminal. */
export const WHEEL_OFF = '\x1b[?1006l\x1b[?1000l'

export interface Wheel {
  /** -1 for a turn up, 1 for a turn down. */
  direction: -1 | 1
  /** The column the pointer sat in, counting from 1. */
  column: number
}

// Ink hands the sequence over as plain input, minus the leading escape
const SGR = /^\[<(\d+);(\d+);(\d+)M$/

/** The wheel turn an Ink input carries, or nothing when it carries a key. */
export function wheelOf(input: string): Wheel | undefined {
  const match = SGR.exec(input)
  if (!match) return undefined

  const button = Number(match[1])
  // Bit 6 marks a wheel turn; the low two bits say which way, 2 and 3 being the sideways pair
  const wheel = (button & 64) !== 0
  const axis = button & 3
  if (!wheel || axis > 1) return undefined

  return { direction: axis === 0 ? -1 : 1, column: Number(match[2]) }
}
