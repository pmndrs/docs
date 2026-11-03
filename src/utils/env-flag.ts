/**
 * Reads the environment variable `name` as a flag: `true` or `false`, and `undefined` when unset
 * -- or empty, which is how the reusable workflow passes an input the caller left out.
 *
 * Throws on anything else, with the variable's name, so the build fails with a reason.
 */
export function parseEnvFlag(name: string, value = ''): boolean | undefined {
  if (value === '') return undefined
  if (value !== 'true' && value !== 'false') {
    throw new Error(`${name}: "${value}" is not \`true\` or \`false\``)
  }
  return value === 'true'
}
