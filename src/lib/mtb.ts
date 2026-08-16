import { pmndrsMtb } from '@/lib/md3'
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
 * Each name here needs four `@theme` lines in globals.css — `--color-note`,
 * `--color-on-note`, `--color-note-container`, `--color-on-note-container`.
 * material-theme-builder maps standard M3 roles only, and a name declared here
 * but unmapped there fails silently: Tailwind emits no rule for
 * `bg-note-container` at all, no error, no warning.
 */
const alertColors = [
  { name: 'note', hex: process.env.THEME_NOTE || '#1f6feb', blend: true },
  { name: 'tip', hex: process.env.THEME_TIP || '#238636', blend: true },
  { name: 'important', hex: process.env.THEME_IMPORTANT || '#8957e5', blend: true },
  { name: 'warning', hex: process.env.THEME_WARNING || '#d29922', blend: true },
  { name: 'caution', hex: process.env.THEME_CAUTION || '#da3633', blend: true },
]

/**
 * The theme this site mounts: the pmndrs seed, plus our alert colours.
 *
 * Spread rather than edited, so `src/lib/md3.ts` stays a verbatim copy of the
 * installed item and re-installing it is a clean overwrite.
 */
export const docsMtb = {
  ...pmndrsMtb,
  customColors: alertColors,
} satisfies MtbConfig
