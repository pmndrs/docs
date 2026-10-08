import { pmndrsMtb } from '@/lib/md3'
import { parseCustomColors } from '@/utils/custom-colors'
import { parseThemeColor, parseThemeFlag } from '@/utils/theme-seeds'
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
 * The theme this site mounts: the pmndrs seed, the other seeds a site may give
 * (`THEME_COLOR_MATCH`, `THEME_SECONDARY`, `THEME_TERTIARY`, `THEME_NEUTRAL`,
 * `THEME_NEUTRAL_VARIANT`, `THEME_ERROR`), our alert colours, and the site's own.
 *
 * Each seed is optional: unset, the primary derives it. Color match renders each
 * core and custom colour true to its own input, as Material Theme Builder's
 * "Color match" does, which makes `scheme` moot (see `SchemeToggle`). Parsed at
 * build time: a value that is not a hex colour fails the build, with its reason.
 *
 * Spread rather than edited, so `src/lib/md3.ts` stays a verbatim copy of the
 * installed item and re-installing it is a clean overwrite.
 */
export const docsMtb = {
  ...pmndrsMtb,
  colorMatch: parseThemeFlag('COLOR_MATCH', process.env.THEME_COLOR_MATCH),
  secondary: parseThemeColor('SECONDARY', process.env.THEME_SECONDARY),
  tertiary: parseThemeColor('TERTIARY', process.env.THEME_TERTIARY),
  neutral: parseThemeColor('NEUTRAL', process.env.THEME_NEUTRAL),
  neutralVariant: parseThemeColor('NEUTRAL_VARIANT', process.env.THEME_NEUTRAL_VARIANT),
  error: parseThemeColor('ERROR', process.env.THEME_ERROR),
  customColors: [...alertColors, ...siteColors],
} satisfies MtbConfig
