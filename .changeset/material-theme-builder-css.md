---
'@pmndrs/docs': patch
---

`globals.css` stops restating the colour layer by hand. The ~60-line `@theme` mapping is now `@plugin 'material-theme-builder/tailwind'`, which declares the same names and takes the five alert colours as an option; the 31-line shadcn remap is now `@import 'material-theme-builder/shadcn.css'`, which is where those exact 31 declarations came from. 95 lines removed, nothing to keep in sync.
