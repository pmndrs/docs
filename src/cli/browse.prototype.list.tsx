// PROTOTYPE — throwaway. See browse.prototype.tsx.
//
// Ink has no <select>, so B and C share this one: a windowed list that keeps the
// cursor in view. It is a primitive, not a layout — each variant still decides
// where it sits and what a row says.

import { Box, Text } from 'ink'

export interface Row {
  label: string
  hint?: string
}

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
  const visible = rows.slice(start, start + window)

  return (
    <Box flexDirection="column" height={window} flexShrink={0}>
      {visible.map((row, i) => {
        const index = start + i
        const on = index === cursor
        return (
          <Text key={index} wrap="truncate">
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

/** Move a cursor with wrap-around; returns the same value when the list is empty. */
export function moveCursor(cursor: number, delta: number, length: number) {
  if (length === 0) return 0
  return (cursor + delta + length) % length
}
