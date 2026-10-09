import { Inconsolata, Inter } from 'next/font/google'

// Both typefaces come from pmndrs/design-system, through `next/font/google`, which downloads them
// at build time and serves them from the site, so a reader's browser never asks Google for them.
// Each one's `.variable` is a class that sets its CSS variable: whoever renders the root puts both
// on `<html>`, and `globals.css` hands the variables to Tailwind's utilities. That is the root
// layout for the site, and `.storybook/preview.tsx` for the stories, since Storybook never renders
// the layout. Both import them from here, so the two cannot load different fonts.

/**
 * Inter as the preset `b1VlIttI` writes it (`pnpm exec shadcn init --preset b1VlIttI`), the design
 * system's own. Its variable is `--font-sans` itself, which `globals.css` hands to the `font-sans`
 * utility and `--font-heading`.
 */
export const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

/**
 * Inconsolata as the design system's `font-mono` item writes it
 * (`pnpm exec shadcn add pmndrs/design-system/font-mono#v0.6.0`). Its variable is `--font-mono`
 * itself, which `globals.css` hands to the `font-mono` utility and to `code, kbd, samp, pre`;
 * Sandpack reads it too.
 *
 * The item writes no `subsets`, which `next/font/google` requires to preload the font: `latin`, as
 * for Inter. Nor can it write a fallback: the `registry:font` schema has no field for one, so the
 * site adds it. Left to itself, `next/font` falls back on an `Inconsolata Fallback` face, Arial
 * resized to Inconsolata's metrics, and on no generic family: code would be set proportional until
 * the font loads, or for good if it fails to. `adjustFontFallback: false` drops that face, and the
 * fallback is the platform's monospace.
 */
export const inconsolata = Inconsolata({
  subsets: ['latin'],
  variable: '--font-mono',
  adjustFontFallback: false,
  fallback: ['ui-monospace', 'monospace'],
})
