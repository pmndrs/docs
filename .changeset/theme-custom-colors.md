---
'@pmndrs/docs': minor
---

feat: `THEME_CUSTOM_COLORS`, a site's own custom colors as roles of the theme

`THEME_CUSTOM_COLORS` (workflow input `theme_custom_colors`, CLI `--theme-custom-colors`) takes `name:hex[:blend]` entries, comma-separated, e.g. `brand:#ff2d95:blend,status:#17b26a`: each is a custom color of `<Mtb>` next to the built-in `note`, `tip`…, so `<Color role="brand" />` and `bg-brand` follow the scheme, contrast and primary the reader picks instead of a hex pasted in the page. A malformed entry, or a built-in name, fails the build with its reason.
