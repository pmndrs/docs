/**
 * Bolds matching text in a string, returning HTML.
 */
const highlight = (string: string, match: string | RegExp) =>
  string.replace(match, (target: string) => `<span class="font-bold">${target}</span>`)

export default highlight
