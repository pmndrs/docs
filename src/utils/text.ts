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
