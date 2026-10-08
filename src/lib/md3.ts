import type { MtbConfig } from 'material-theme-builder'

/**
 * The pmndrs Material Design 3 seed.
 *
 * The colours every pmndrs site derives from. The shadcn preset carries radius
 * and typography, not colour — moving `source` here is what actually moves the
 * rendered palette.
 *
 * Every colour, and the contrast, is overridable per deployment through a
 * `THEME_*` env var, so a site can reseed without forking the file.
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
 * still belong to the pmndrs palette. That `customColors` replaces the seven
 * shipped below; spread `...pmndrsMtb.customColors` into it to keep them.
 * Then name them in the `@plugin` line this item added to your CSS. It is
 * installed in statement form (`@plugin '...';`); give it a body — that is
 * all the wiring there is:
 *
 * ```css
 * @plugin "material-theme-builder/tailwind" {
 *   custom-colors: note;
 * }
 * ```
 *
 * Four roles follow (`bg-note`, `text-on-note`, `bg-note-container`,
 * `text-on-note-container`) and eleven shades (`bg-note-50` … `bg-note-950`).
 * The name is used verbatim, so `myColor` stays `bg-myColor`.
 */
export const pmndrsMtb = {
  /** poimandres lime — the primary (also exposed as `lime` below). */
  source: process.env.THEME_PRIMARY || '#CAF543',
  /**
   * Material Theme Builder's "Color match — Stay true to my color inputs": each
   * core colour keeps its seed's chroma, and the seed itself lands in the
   * container role. It replaces `scheme`, which is ignored while it is on —
   * Color match is the Content variant, applied to each seed separately.
   */
  colorMatch: true,
  contrast: Number(process.env.THEME_CONTRAST) || 0,
  /**
   * The two neutral seeds look nothing like the ramps they produce, and that is
   * expected. Under Color match a neutral ramp takes its seed's hue at a fraction
   * of its chroma: chroma / 8 for neutral, chroma / 8 + 4 for neutral-variant.
   * So a seed carries 8x the chroma you want back.
   *
   * - neutral `#c1b793`, the warm grey's hue (99) at chroma 16, gives the
   *   surfaces and body text a ramp at chroma 2: a warm grey.
   * - neutral-variant `#495720`, the lime's hue (124) at chroma 32, gives the
   *   outlines and secondary text a ramp at chroma 8 (32 / 8 + 4): a hint of
   *   the primary.
   *
   * A seed's tone does not matter, only its hue and chroma.
   */
  neutral: process.env.THEME_NEUTRAL || '#c1b793',
  neutralVariant: process.env.THEME_NEUTRAL_VARIANT || '#495720',
  /** red. */
  error: process.env.THEME_ERROR || '#FF4980',
  /**
   * The seven brand colours, by name: `bg-lime`, `text-on-teal`,
   * `bg-cyan-container`, `bg-purple-500`, … Lime is also the primary `source`
   * above; red also drives the `error` role.
   *
   * `blend: false` keeps each colour true to its hex. `blend: true` would
   * harmonize them toward the lime seed — more cohesive, but it pulls the hues
   * off their brand values (measured ΔE 12–27 vs ~0–9 when exact).
   *
   * Secondary and tertiary are intentionally unused — MD3 still generates them
   * (there's no flag to disable them), but these take their place.
   */
  customColors: [
    { name: 'lime', hex: '#CAF543', blend: false },
    { name: 'teal', hex: '#00F7A3', blend: false },
    { name: 'cyan', hex: '#2BDCF6', blend: false },
    { name: 'purple', hex: '#D855F9', blend: false },
    { name: 'red', hex: '#FF4980', blend: false },
    { name: 'orange', hex: '#FFC043', blend: false },
    { name: 'yellow', hex: '#EBFF0F', blend: false },
  ],
} satisfies MtbConfig
