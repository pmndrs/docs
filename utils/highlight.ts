/**
 * Bolds matching text, returning HTML.
 */
const highlight = (text: string, target: string | RegExp) =>
  text.replace(
    typeof target === 'string' ? new RegExp(target, 'gi') : target,
    (match: string) => `<span class="font-bold">${match}</span>`
  )

export default highlight
