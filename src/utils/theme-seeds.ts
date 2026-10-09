//
// The seeds of the site's theme beyond its primary: the core colors `<Mtb>` lets a site override
// (`THEME_SECONDARY`, `THEME_TERTIARY`, `THEME_NEUTRAL`, `THEME_NEUTRAL_VARIANT`, `THEME_ERROR`)
// and its color match (`THEME_COLOR_MATCH`), read from the environment at build time -- each
// optional: a site that sets none gets the pmndrs seeds (see `src/lib/mtb.ts`).
//

// 3, 6 or 8 hex digits, the forms `argbFromHex` reads
export const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i

/**
 * Reads `THEME_<name>` as a hex color (`#rgb`, `#rrggbb` or `#aarrggbb`): `undefined` when unset
 * -- or empty, which is how the reusable workflow passes an input the caller left out.
 *
 * Throws on anything else, so the build fails with a reason rather than `<Mtb>` throwing from
 * inside the layout, where the variable is not named.
 */
export function parseThemeColor(name: string, value = ''): string | undefined {
  if (value === '') return undefined
  if (!HEX.test(value)) {
    throw new Error(`THEME_${name}: "${value}" is not a hex color (e.g. \`#ff2d95\`)`)
  }
  return value
}

/**
 * Reads `THEME_<name>` as a flag: `true` or `false`, and `undefined` when unset or empty, as
 * `parseThemeColor` does. Throws on anything else, with the variable's name.
 */
export function parseThemeFlag(name: string, value = ''): boolean | undefined {
  if (value === '') return undefined
  if (value !== 'true' && value !== 'false') {
    throw new Error(`THEME_${name}: "${value}" is not \`true\` or \`false\``)
  }
  return value === 'true'
}
