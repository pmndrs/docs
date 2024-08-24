/**
 * Escapes special characters from text input.
 */
export const escape = (text: string) => text.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

/**
 * Bolds matching text, returning HTML.
 */
export const highlight = (text: string, target: string) =>
  text.replace(new RegExp(target, 'gi'), (match: string) => `<mark>${match}</mark>`)
