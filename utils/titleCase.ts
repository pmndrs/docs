/**
 * Converts text to Title Case.
 */
const titleCase = (str: string) => str.replace(/\b\S/g, (t) => t.toUpperCase())

export default titleCase
