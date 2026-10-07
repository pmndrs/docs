//
// A site's own custom colors, as written in `THEME_CUSTOM_COLORS`: the ones `<Mtb>` turns into
// roles of the theme (`--md-sys-color-<name>`, `-container`, `on-`…) next to the built-in `note`,
// `tip`… — so a `<Color role="brand" />` or a `bg-brand` follows the site's scheme, contrast and
// primary like any other role, instead of a hex pasted in the page.
//

/** One custom color, as `<Mtb>` takes it in its `customColors`. */
export type CustomColor = {
  name: string
  hex: string
  blend: boolean
}

// kebab-case, the way a role is named in MDX (`<Color role="brand-alt" />`)
const NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
// 3, 6 or 8 hex digits, the forms `argbFromHex` reads
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i

/**
 * Parses `THEME_CUSTOM_COLORS`: entries of `name:hex[:blend]`, separated by commas, spaces or
 * newlines (as `VERSION_BRANCHES_LIST` is), e.g. `brand:#ff2d95:blend,status:#17b26a`.
 *
 * - `name`: kebab-case, the role in MDX
 * - `hex`: `#rgb`, `#rrggbb` or `#aarrggbb`
 * - `:blend`: harmonize the color with the primary, as the built-in ones are; absent, the
 *   color is taken as is
 *
 * Throws on a malformed entry, a name given twice, or a name among `reserved` — the built-in
 * colors, whose `THEME_<NAME>` variable is the way to change them — so the build fails with a
 * reason rather than silently dropping a color the pages then read as `transparent`.
 */
export function parseCustomColors(list = '', reserved: readonly string[] = []): CustomColor[] {
  const colors: CustomColor[] = []

  for (const entry of list.split(/[\s,]+/).filter((entry) => entry !== '')) {
    const [name, hex, flag, ...rest] = entry.split(':')

    if (!name || !hex || rest.length > 0) {
      throw new Error(
        `THEME_CUSTOM_COLORS: "${entry}" is not a \`name:hex\` or \`name:hex:blend\` entry`,
      )
    }
    if (!NAME.test(name)) {
      throw new Error(`THEME_CUSTOM_COLORS: "${name}" is not a kebab-case name (e.g. \`brand\`)`)
    }
    if (!HEX.test(hex)) {
      throw new Error(
        `THEME_CUSTOM_COLORS: "${hex}" of "${name}" is not a hex color (e.g. \`#ff2d95\`)`,
      )
    }
    if (flag !== undefined && flag !== 'blend') {
      throw new Error(`THEME_CUSTOM_COLORS: "${flag}" of "${name}" is not \`blend\``)
    }
    if (reserved.includes(name)) {
      throw new Error(
        `THEME_CUSTOM_COLORS: "${name}" is a built-in color, set THEME_${name.toUpperCase()} instead`,
      )
    }
    if (colors.some((color) => color.name === name)) {
      throw new Error(`THEME_CUSTOM_COLORS: "${name}" is given twice`)
    }

    colors.push({ name, hex, blend: flag === 'blend' })
  }

  return colors
}
