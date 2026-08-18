---
'@pmndrs/docs': patch
---

Move the colour engine from `react-mcu` to [`material-theme-builder`](https://github.com/abernier/material-theme-builder), its successor. At the API level it is a rename: `--mcu-*` becomes `--md-sys-color-*`, the standard MD3 system-token name. The `--color-*` names the `@theme` mapping declares are unchanged, so every `bg-surface`, `bg-primary-container` and `text-on-surface-variant` keeps working untouched, and the `THEME_*` env vars behave exactly as before.

The palette is not quite identical, though. 57 of the 67 roles match exactly, including all 49 standard M3 ones; the 10 that differ all belong to the five `blend: true` custom colours, which the two packages harmonize differently. In practice the markdown alerts get more muted backgrounds — most visibly **Important** and **Caution**, whose hues sit furthest from the seed. **Tip** and **Warning** are unchanged.

Two components name the raw variables rather than a Tailwind utility — `Code` for its fixed prism colour, `Sandpack` for its three surface levels — and are the only component edits.
