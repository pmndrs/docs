// The styled-line model, as Ink. `toAnsi` is the same lines for a pager.

import { Text } from 'ink'
import { link, type Line } from './browse.markdown'

export function Lines({ lines }: { lines: Line[] }) {
  return (
    <>
      {lines.map((line, index) => (
        // An empty line still has to occupy one, or the layout closes up around it
        <Text key={index} wrap="truncate">
          {line.length === 0
            ? ' '
            : line.map((span, at) => (
                <Text
                  key={at}
                  color={span.fg}
                  bold={span.bold}
                  dimColor={span.dim}
                  italic={span.italic}
                  underline={span.underline}
                >
                  {span.href ? link(span.href, span.text) : span.text}
                </Text>
              ))}
        </Text>
      ))}
    </>
  )
}
