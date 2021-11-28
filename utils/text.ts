/**
 * Bolds matching text, returning HTML.
 */
export const highlight = (text: string, target: string | RegExp) =>
  text.replace(
    typeof target === 'string' ? new RegExp(target, 'gi') : target,
    (match: string) => `<span class="font-bold">${match}</span>`
  )

/**
 * Converts text to Title Case.
 */
export const titleCase = (str: string) => str.replace(/\b\S/g, (t) => t.toUpperCase())
