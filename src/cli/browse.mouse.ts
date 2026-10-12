// The wheel, so the pane under the pointer is the one that moves. A terminal only reports it
// once asked, and reports it as an escape sequence -- `\x1b[<button;column;rowM` in the SGR
// encoding every terminal worth the name understands.

import { useStdin } from 'ink'
import { useEffect, useEffectEvent } from 'react'

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

const SGR = /^\x1b?\[<(\d+);(\d+);(\d+)M$/

/** The wheel turn a terminal report carries, or nothing when it carries a key. */
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

/** Ink filters mouse reports out of keyboard input, so read them from its stdin stream. */
export function useWheel(onWheel: (wheel: Wheel) => void) {
  const { stdin } = useStdin()
  const handleWheel = useEffectEvent(onWheel)

  useEffect(() => {
    let pending = ''
    const handleData = (chunk: string | Buffer) => {
      const input = pending + chunk.toString()
      for (const match of input.matchAll(/\x1b\[<\d+;\d+;\d+[Mm]/g)) {
        const wheel = wheelOf(match[0])
        if (wheel) handleWheel(wheel)
      }
      // A terminal can split a report across reads. Keep only an unfinished SGR prefix.
      pending = /\x1b(?:\[(?:<(?:\d+(?:;\d*(?:;\d*)?)?)?)?)?$/.exec(input)?.[0] ?? ''
    }

    stdin.on('data', handleData)
    return () => {
      stdin.removeListener('data', handleData)
    }
  }, [stdin])
}
