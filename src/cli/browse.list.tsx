// Ink is a renderer, not a widget set: there is no <select>, so here is the one the reader
// needs. A primitive, not a layout -- the caller decides what a row says and where it sits.

import { Box, Text } from 'ink'

export interface Row {
  label: string
  hint?: string
}

/** A list of `height` rows that keeps the cursor in view, centred when it can be. */
export function List({
  rows,
  cursor,
  height,
  focused = true,
}: {
  rows: Row[]
  cursor: number
  height: number
  focused?: boolean
}) {
  const window = Math.max(1, height)
  const start = Math.max(0, Math.min(cursor - Math.floor(window / 2), rows.length - window))

  return (
    <Box flexDirection="column" height={window} flexShrink={0}>
      {rows.slice(start, start + window).map((row, index) => {
        const at = start + index
        const on = at === cursor

        return (
          <Text key={at} wrap="truncate">
            <Text color={on && focused ? 'cyan' : undefined}>{on ? '❯ ' : '  '}</Text>
            <Text color={on ? (focused ? 'cyan' : 'white') : undefined} bold={on && focused}>
              {row.label}
            </Text>
            {row.hint ? <Text dimColor>{`  ${row.hint}`}</Text> : null}
          </Text>
        )
      })}
    </Box>
  )
}

/** Moves a cursor within `length`, stopping at both ends rather than wrapping. */
export function moveCursor(cursor: number, delta: number, length: number) {
  if (length === 0) return 0
  return Math.max(0, Math.min(cursor + delta, length - 1))
}
