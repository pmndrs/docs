// PROTOTYPE — throwaway. See browse.prototype.tsx.
//
// Shared by variants B and C only: the styled-line model, rendered as OpenTUI
// <text>/<span>. Variant A goes through `toAnsi` instead.

import type { Line, Span } from './browse.prototype.markdown'

function Styled({ span }: { span: Span }) {
  let node = <>{span.text}</>
  if (span.bold) node = <b>{node}</b>
  if (span.italic) node = <i>{node}</i>
  if (span.underline) node = <u>{node}</u>
  return <span fg={span.fg}>{node}</span>
}

export function Lines({ lines }: { lines: Line[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <text key={i}>
          {line.length === 0 ? ' ' : line.map((span, j) => <Styled key={j} span={span} />)}
        </text>
      ))}
    </>
  )
}
