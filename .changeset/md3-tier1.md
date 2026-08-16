---
'@pmndrs/docs': minor
---

Take the Material Design 3 colour layer from `pmndrs/design-system` instead of maintaining it here. The hand-written `@theme` mapping and the shadcn remap — around 105 lines that had to be kept in step with the colour package by hand — are replaced by one registry item, `pmndrs/design-system/md3`, which brings its own Tailwind mapping and the config it maps. `react-mcu` gives way to `material-theme-builder`, so the CSS variables are now `--md-sys-color-*`; every `bg-surface` / `text-on-surface-variant` utility keeps working untouched, because the `--color-*` names on top of them are identical.

The seed moves to poimandres mint (`#5de4c7`) — this is the visible change — and it now lives in exactly one place, the installed `src/lib/md3.ts`, rather than being restated in the layout and in two workflows. `THEME_PRIMARY`, `THEME_SCHEME` and `THEME_CONTRAST` still override it per deployment; a site that wants its own seed sets the workflow input, and one that doesn't inherits the pmndrs default.

The five alert colours stay here, in `src/lib/mtb.ts`, which spreads the pmndrs seed and adds them. They are GitHub's palette and only this generator renders markdown alerts, so they are not the design system's to carry — but they are still harmonized against the seed, and `THEME_NOTE`, `THEME_TIP`, `THEME_IMPORTANT`, `THEME_WARNING` and `THEME_CAUTION` still work.
