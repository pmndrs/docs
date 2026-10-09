---
'@pmndrs/docs': minor
---

The alert colours (note, tip, important, warning and caution) now come from pmndrs/design-system v0.8.0, whose `md3-base` ships them as roles: `src/lib/md3.ts` is re-copied from that release, and the site no longer defines them itself. They keep GitHub's hues, `THEME_NOTE`…`THEME_CAUTION` still override them, and `THEME_CUSTOM_COLORS` still refuses their names. The `keypoints` and `color` registry blocks depend on `pmndrs/design-system/theme#v0.8.0`.

The components that picked their own colours now take them from the MD3 roles. GitHub alerts set their text in the `on-…-container` role of their background. A Sandpack editor is coloured like a code block. It sits on the same dark background, in light and dark alike. Its decorators use a primary tone, not a hard-coded blue. Mermaid diagrams use Mermaid's `base` theme, fed with the palette's roles. They follow light and dark, and the colour picked in the theme picker. A diagram that fails to render shows in the `error` role. Dialog and sheet overlays use the `scrim` role, at MD3's 32% opacity.
