---
'@pmndrs/docs': minor
---

feat: `THEME_COLOR_MATCH`, `THEME_SECONDARY`, `THEME_TERTIARY`, `THEME_NEUTRAL`, `THEME_NEUTRAL_VARIANT`, `THEME_ERROR` -- the other seeds of the site's palette

Workflow inputs `theme_color_match`, `theme_secondary`, `theme_tertiary`, `theme_neutral`, `theme_neutral_variant`, `theme_error`, CLI `--theme-color-match`, `--theme-secondary`… Each core color `<Mtb>` lets a site override is now reachable instead of derived from the primary alone, and `THEME_COLOR_MATCH="true"` is Material Theme Builder's "Color match": each core and custom color rendered true to its own input, which takes precedence over `THEME_SCHEME` (the scheme toggle is then not shown). A site built from a material-theme-builder seed that uses them, as pmndrs/design-system's, gets the palette it ships rather than a tonal spot approximation of it. A value that is not a hex color fails the build with its reason. material-theme-builder bumped to 5.2.1, where `colorMatch` is implemented.
