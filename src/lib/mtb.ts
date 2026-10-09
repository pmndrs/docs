import { pmndrsMtb } from '@/lib/md3'
import { parseCustomColors } from '@/utils/custom-colors'
import { parseThemeColor, parseThemeFlag, parseThemeSeed } from '@/utils/theme-seeds'
import type { MtbConfig } from 'material-theme-builder'

/**
 * GitHub's alert palette, the colours `rehype-github-alerts` renders.
 *
 * These are ours, not the design system's: nothing outside this generator draws
 * markdown alerts, and the hexes are GitHub's rather than poimandres'. The design
 * system owns the seed; this owns what the seed has no M3 role for.
 *
 * `blend: true` harmonizes each one against that seed, so they shift with the
 * theme instead of sitting on top of it.
 *
 * Name each one in the `@plugin 'material-theme-builder/tailwind'` block in
 * globals.css, and the package emits the Tailwind utilities for it.
 */
const alertColors = [
  { name: 'note', hex: process.env.THEME_NOTE || '#1f6feb', blend: true },
  { name: 'tip', hex: process.env.THEME_TIP || '#238636', blend: true },
  { name: 'important', hex: process.env.THEME_IMPORTANT || '#8957e5', blend: true },
  { name: 'warning', hex: process.env.THEME_WARNING || '#d29922', blend: true },
  { name: 'caution', hex: process.env.THEME_CAUTION || '#da3633', blend: true },
]

/**
 * The site's own custom colours, from `THEME_CUSTOM_COLORS`: roles of the theme
 * too (`<Color role="brand" />`), so they follow the scheme, contrast and primary
 * the reader picks. Parsed at build time: a malformed entry fails the build, with
 * its reason.
 */
const siteColors = parseCustomColors(
  process.env.THEME_CUSTOM_COLORS,
  alertColors.map((color) => color.name),
)

/**
 * The seven pmndrs colours (`lime`, `teal`…), less any the site redefines under
 * the same name: its own `THEME_CUSTOM_COLORS` entry wins.
 */
const pmndrsColors = pmndrsMtb.customColors.filter(
  (color) => !siteColors.some((siteColor) => siteColor.name === color.name),
)

/**
 * The theme this site mounts: the pmndrs seed, whatever of it the site
 * overrides, our alert colours and the site's own.
 *
 * The pmndrs seed already reads `THEME_PRIMARY`, `THEME_CONTRAST`,
 * `THEME_NEUTRAL`, `THEME_NEUTRAL_VARIANT` and `THEME_ERROR`; the last three
 * are read again here, to fail the build, with a reason, on a value that is not
 * a hex colour, and to take `auto`: no seed, so the primary derives that colour
 * (see `parseThemeSeed`). The rest is this generator's:
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
  neutral: parseThemeSeed('NEUTRAL', process.env.THEME_NEUTRAL, pmndrsMtb.neutral),
  neutralVariant: parseThemeSeed(
    'NEUTRAL_VARIANT',
    process.env.THEME_NEUTRAL_VARIANT,
    pmndrsMtb.neutralVariant,
  ),
  error: parseThemeSeed('ERROR', process.env.THEME_ERROR, pmndrsMtb.error),
  customColors: [...pmndrsColors, ...alertColors, ...siteColors],
} satisfies MtbConfig
