---
'@pmndrs/docs': patch
---

The `keypoints` and `color` registry blocks now depend on `pmndrs/design-system/theme#v0.6.0`, in place of `pmndrs/design-system/md3#v0.5.0`. pmndrs/design-system v0.6.0 renamed its `md3` item to `theme`, the single item to install, which itself pulls `md3-base` and `font-mono`; there is no `md3` item from that tag on. The palette is the same one `md3` baked, so the blocks render as before; installing either one now also brings the pmndrs monospace, Inconsolata, on `code`, `kbd`, `samp` and `pre`.
