import type { MtbConfig } from 'material-theme-builder'

/**
 * The pmndrs Material Design 3 seed.
 *
 * The colours every pmndrs site derives from. The shadcn preset carries radius
 * and typography, not colour — moving `source` here is what actually moves the
 * rendered palette.
 *
 * Every value is overridable per deployment through a `THEME_*` env var, so a
 * site can reseed without forking the file.
 *
 * Read from a React Server Component (a Next.js root layout, typically): the
 * non-`NEXT_PUBLIC_` vars below are only substituted on the server.
 *
 * Need colours M3 has no role for — alert levels, a status palette? Extend this
 * rather than editing it, so the next update of this item stays a clean
 * overwrite:
 *
 * ```ts
 * export const myMtb = {
 *   ...pmndrsMtb,
 *   customColors: [{ name: 'note', hex: '#1f6feb', blend: true }],
 * } satisfies MtbConfig
 * ```
 *
 * `blend: true` harmonizes them against the seed above, so they stay yours and
 * still belong to the pmndrs palette. One catch, and it fails silently: the
 * package's Tailwind mapping covers standard M3 roles only. Every custom colour
 * needs four `@theme` lines of your own — `--color-note`, `--color-on-note`,
 * `--color-note-container`, `--color-on-note-container` — or Tailwind emits no
 * rule at all for `bg-note-container`, with no error.
 */
export const pmndrsMtb = {
  /** poimandres slate. */
  source: process.env.THEME_PRIMARY || '#323e48',
  scheme: (process.env.THEME_SCHEME || 'tonalSpot') as MtbConfig['scheme'],
  contrast: Number(process.env.THEME_CONTRAST) || 0,
} satisfies MtbConfig
