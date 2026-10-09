---
'@pmndrs/docs': minor
---

Take the Material Design 3 colour layer from `pmndrs/design-system` instead of maintaining it here. The hand-written `@theme` mapping and the shadcn remap — around 105 lines that had to be kept in step with the colour package by hand — are replaced by one registry item, `pmndrs/design-system/md3`, which brings its own Tailwind mapping and the config it maps. `react-mcu` gives way to `material-theme-builder`, so the CSS variables are now `--md-sys-color-*`; every `bg-surface` / `text-on-surface-variant` utility keeps working untouched, because the `--color-*` names on top of them are identical.

**The default palette changes, for every site — every caller of the reusable `build.yml` included.** The defaults are now pmndrs/design-system v0.5.0's seed, which lives in exactly one place, the installed `src/lib/md3.ts`, rather than being restated in the layout and in the workflows: the brand lime `#CAF543` under Material Theme Builder's color match, in place of the slate `#323e48` under `tonalSpot`, with neutral, neutral variant and error seeds of its own (`#c1b793`, a warm grey; `#495720`; `#FF4980`). `build.yml`'s `theme_*` inputs now default to empty, which means that seed. So:

- a site that sets no `THEME_*` (no `theme_*` input) now renders the pmndrs palette, lime on warm grey;
- a site that sets only its primary (`THEME_PRIMARY: '#323e48'`, say) now gets that primary under color match, on the pmndrs neutrals and error.

A site can still pin its own primary or any seed — `THEME_PRIMARY`, `THEME_CONTRAST`, `THEME_NEUTRAL`, `THEME_NEUTRAL_VARIANT`, `THEME_ERROR`, and `THEME_COLOR_MATCH: false` to bring `THEME_SCHEME` back into play. pmndrs/docs' own deployments (GitHub Pages, Vercel, `dev.sh`, `start.sh`) no longer pin anything: they render the default.

The seed also brings the seven pmndrs colours as custom colours of every site: `lime`, `teal`, `cyan`, `purple`, `red`, `orange` and `yellow`, so `<Color role="teal" />` works out of the box. A `THEME_CUSTOM_COLORS` entry of the same name replaces one.

The five alert colours stay here, in `src/lib/mtb.ts`, which spreads the pmndrs seed and adds them. They are GitHub's palette and only this generator renders markdown alerts, so they are not the design system's to carry — but they are still harmonized against the seed, and `THEME_NOTE`, `THEME_TIP`, `THEME_IMPORTANT`, `THEME_WARNING` and `THEME_CAUTION` still work.
