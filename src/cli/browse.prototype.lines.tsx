// PROTOTYPE — throwaway. See browse.prototype.tsx.
//
// Shared by variants B and C only: the styled-line model, rendered as Ink
// <Text>. Variant A goes through `toAnsi` instead.

import { Text } from 'ink'
import type { Line } from './browse.prototype.markdown'

export function Lines({ lines }: { lines: Line[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <Text key={i} wrap="truncate">
          {line.length === 0
            ? ' '
            : line.map((span, j) => (
                <Text
                  key={j}
                  color={span.fg}
                  bold={span.bold}
                  dimColor={span.dim}
                  italic={span.italic}
                  underline={span.underline}
                >
                  {span.text}
                </Text>
              ))}
        </Text>
      ))}
    </>
  )
}
