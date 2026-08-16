---
'@pmndrs/docs': patch
---

The Material Design 3 palette is now computed on the server instead of in every visitor's browser. `<Mtb>` carries `'use client'`, so the colour package's palette code shipped to the client and recomputed the same values on each load. The root layout calls `builder` — the package's root export, which has no `'use client'` — and emits the CSS itself. Same rendered result, no palette code on the client. The seed is still `THEME_PRIMARY` / `THEME_SCHEME` / `THEME_CONTRAST`.

Takes `pmndrs/design-system/md3-base` v0.3.0 — the shared colour layer without its baked palette, since this site supplies its own. Storybook gets that palette from an `<Mtb>` decorator, which fixes something invisible until now — the preview imports the stylesheet and rendered nothing else, so `--md-sys-color-*` was undefined there, and since the shadcn remap points the stock variables at MD3 roles, every story has been rendering colourless. Stories are worth looking at again.
