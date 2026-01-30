/**
 * Escapes special characters from text input.
 */
export const escape = (text: string) => text.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

/**
 * Bolds matching text, returning HTML.
 */
export const highlight = (text: string, target: string) =>
  target.length > 0
    ? text.replace(new RegExp(escape(target), 'gi'), (match: string) => `<mark>${match}</mark>`)
    : text

export function initials(name: string) {
  const parts = name.split(' ')

  if (parts.length > 1) {
    return parts
      .slice(0, 2)
      .map(([char]) => char)
      .join('')
      .toUpperCase()
  }

  return name.slice(0, 2).toUpperCase()
}

/**
 * Parses inline code blocks (text wrapped in backticks) from a string.
 * Returns an array of segments that can be used to render mixed content.
 */
export function parseInlineCode(text: string): Array<{ type: 'text' | 'code'; content: string }> {
  const segments: Array<{ type: 'text' | 'code'; content: string }> = []
  const regex = /`([^`]+)`/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    // Add the code block (without backticks)
    segments.push({ type: 'code', content: match[1] })
    lastIndex = regex.lastIndex
  }

  // Add remaining text after the last code block
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) })
  }

  // If no code blocks were found, return the original text as a single text segment
  if (segments.length === 0) {
    segments.push({ type: 'text', content: text })
  }

  return segments
}
