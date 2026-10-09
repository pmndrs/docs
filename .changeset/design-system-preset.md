---
'@pmndrs/docs': minor
---

Take the shadcn preset and the typefaces from `pmndrs/design-system` too (#689). The site's theme is now pmndrs/design-system's own preset, `b1VlIttI` (base-luma), re-applied with `shadcn init --preset b1VlIttI`. Its radius scale is multiplicative — every step a multiple of `--radius` (`sm` 0.6×, `md` 0.8×, `xl` 1.4×) where it used to add or subtract a few pixels — so `rounded-sm`, `rounded-md` and `rounded-xl` corners shift slightly; `rounded-lg` and the larger steps are unchanged. Sandpack's radii follow those tokens instead of literals: the frame takes `--radius-lg`, a highlighted line `--radius-sm`.

Both typefaces now come from `next/font/google`: Inter, as the preset writes it, and Inconsolata, from pmndrs/design-system's `font-mono` item (`shadcn add pmndrs/design-system/font-mono`). They are fetched at build time and self-hosted at runtime, as before, but by Next.js: the committed woff2 files under `src/fonts/`, the `@fontsource/inter` and `@fontsource/inconsolata` dependencies and the `scripts/copy-fonts.sh` step of `prepare` are gone. `--font-sans` and `--font-mono` keep their names, so `font-sans` / `font-mono` keep working untouched.

The registry blocks `keypoints` and `color` now depend on `pmndrs/design-system/theme#v0.6.0`, in place of `pmndrs/design-system/md3`. The palette is unchanged: still seed-driven, per library, through the same `THEME_*` variables.
