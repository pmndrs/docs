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

/**
 * Starts text a little before the first match of target, so that the match shows even when the
 * text is cut to a few lines. The cut falls on a word boundary, marked with an ellipsis.
 */
export function excerpt(text: string, target: string, charsBefore = 60) {
  const matchIndex = text.toLowerCase().indexOf(target.toLowerCase())
  if (target.length === 0 || matchIndex <= charsBefore) return text

  const cutIndex = matchIndex - charsBefore
  const spaceAfterCut = text.slice(cutIndex, matchIndex).search(/\s/)
  // No space between the cut and the match: cut mid-word rather than past the match
  const start = spaceAfterCut === -1 ? cutIndex : cutIndex + spaceAfterCut + 1
  return `…${text.slice(start)}`
}

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
