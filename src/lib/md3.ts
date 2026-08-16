import type { MtbConfig } from 'material-theme-builder'

/**
 * The pmndrs Material Design 3 seed.
 *
 * This is Tier 1: the colours every pmndrs site derives from. The shadcn preset
 * carries radius and typography, not colour — moving `source` here is what
 * actually moves the rendered palette.
 *
 * Every value is overridable per deployment through a `THEME_*` env var, so a
 * site can reseed without forking the file.
 *
 * Read from a React Server Component (a Next.js root layout, typically): the
 * non-`NEXT_PUBLIC_` vars below are only substituted on the server.
 */
export const pmndrsMtb = {
  /** poimandres mint. */
  source: process.env.THEME_PRIMARY || '#5de4c7',
  scheme: (process.env.THEME_SCHEME || 'tonalSpot') as MtbConfig['scheme'],
  contrast: Number(process.env.THEME_CONTRAST) || 0,

  /**
   * GitHub's alert palette, harmonized against the seed (`blend: true`).
   *
   * Each one emits `--md-sys-color-<name>`, `-on-<name>`, `-<name>-container`
   * and `-on-<name>-container`. The Tailwind `@theme` mapping for those four
   * ships in this item's `css` — the package's `tailwind.css` covers standard
   * M3 roles only, so custom colours have to be mapped by hand. Add a colour
   * here and you must add its four lines there too.
   */
  customColors: [
    { name: 'note', hex: process.env.THEME_NOTE || '#1f6feb', blend: true },
    { name: 'tip', hex: process.env.THEME_TIP || '#238636', blend: true },
    { name: 'important', hex: process.env.THEME_IMPORTANT || '#8957e5', blend: true },
    { name: 'warning', hex: process.env.THEME_WARNING || '#d29922', blend: true },
    { name: 'caution', hex: process.env.THEME_CAUTION || '#da3633', blend: true },
  ],
} satisfies MtbConfig
