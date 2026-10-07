---
'@pmndrs/docs': patch
---

Takes `pmndrs/design-system/md3-base` v0.3.0 — the shared colour layer without its baked palette, since this site supplies its own: the pmndrs seed plus the five alert colours, reseeded live by the reader's theme picks. Storybook now gets that palette from an `<Mtb>` decorator, which fixes something invisible until now — the preview imports the stylesheet and rendered nothing else, so `--md-sys-color-*` was undefined there, and since the shadcn remap points the stock variables at MD3 roles, every story has been rendering colourless. Stories are worth looking at again.
