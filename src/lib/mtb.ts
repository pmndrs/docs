import { pmndrsMtb } from '@/lib/md3'
import { parseCustomColors } from '@/utils/custom-colors'
import { parseThemeColor, parseThemeFlag } from '@/utils/theme-seeds'
import type { MtbConfig } from 'material-theme-builder'

/**
 * The five alert roles, GitHub's alert palette: `pmndrsMtb` ships them (from
 * pmndrs/design-system's `md3-base`), with their `THEME_NOTE`…`THEME_CAUTION`
 * overrides. Named here as the colours `THEME_CUSTOM_COLORS` may not redefine:
 * `THEME_<NAME>` is the way to change one.
 *
 * Name each one in the `@plugin 'material-theme-builder/tailwind'` block in
 * globals.css, and the package emits the Tailwind utilities for it.
 */
const alertNames = ['note', 'tip', 'important', 'warning', 'caution']

/**
 * The site's own custom colours, from `THEME_CUSTOM_COLORS`: roles of the theme
 * too (`<Color role="brand" />`), so they follow the scheme, contrast and primary
 * the reader picks. Parsed at build time: a malformed entry fails the build, with
 * its reason.
 */
const siteColors = parseCustomColors(process.env.THEME_CUSTOM_COLORS, alertNames)

/**
 * The pmndrs colours, in their order: the seven brand ones (`lime`, `teal`…),
 * then the five alerts. Less any brand colour the site redefines under the same
 * name: its own `THEME_CUSTOM_COLORS` entry wins. Never an alert: `siteColors`
 * refuses their names.
 */
const pmndrsColors = pmndrsMtb.customColors.filter(
  (color) => !siteColors.some((siteColor) => siteColor.name === color.name),
)

/**
 * The theme this site mounts: the pmndrs seed and colours (alerts included),
 * whatever of them the site overrides, and the site's own colours.
 *
 * The pmndrs seed already reads `THEME_PRIMARY`, `THEME_CONTRAST`,
 * `THEME_NEUTRAL`, `THEME_NEUTRAL_VARIANT` and `THEME_ERROR`; the last three
 * are read again here only to fail the build, with a reason, on a value that is
 * not a hex colour. The rest is this generator's:
 *
 * - `THEME_COLOR_MATCH`: on in the pmndrs seed, `false` turns it off — each
 *   colour is then toned down to `THEME_SCHEME` instead of staying true to its
 *   input (see `ColorMatchToggle`, `SchemeToggle`)
 * - `THEME_SCHEME`: moot while color match is on; `tonalSpot` when unset (see
 *   `PrimaryColorMtb`)
 * - `THEME_SECONDARY`, `THEME_TERTIARY`: unset, the primary derives them
 *
 * Spread rather than edited, so `src/lib/md3.ts` stays a verbatim copy of the
 * installed item and re-installing it is a clean overwrite.
 */
export const docsMtb = {
  ...pmndrsMtb,
  colorMatch: parseThemeFlag('COLOR_MATCH', process.env.THEME_COLOR_MATCH) ?? pmndrsMtb.colorMatch,
  scheme: (process.env.THEME_SCHEME || undefined) as MtbConfig['scheme'],
  secondary: parseThemeColor('SECONDARY', process.env.THEME_SECONDARY),
  tertiary: parseThemeColor('TERTIARY', process.env.THEME_TERTIARY),
  neutral: parseThemeColor('NEUTRAL', process.env.THEME_NEUTRAL) ?? pmndrsMtb.neutral,
  neutralVariant:
    parseThemeColor('NEUTRAL_VARIANT', process.env.THEME_NEUTRAL_VARIANT) ??
    pmndrsMtb.neutralVariant,
  error: parseThemeColor('ERROR', process.env.THEME_ERROR) ?? pmndrsMtb.error,
  customColors: [...pmndrsColors, ...siteColors],
} satisfies MtbConfig
