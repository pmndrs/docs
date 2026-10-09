---
'@pmndrs/docs': minor
---

The components that picked their own colours now take them from the MD3 roles. GitHub alerts set their text in the `on-…-container` role of their background, rather than plain `on-surface`. A Sandpack editor is coloured like a code block, on the same dark background in light and dark alike, with the same syntax colours, and its highlight and widget decorators use `primary` rather than a hard-coded blue. Mermaid diagrams use Mermaid's `base` theme fed with the palette's roles, follow light and dark and the colour picked in the theme picker, and show a failed diagram in the `error` role. Dialog and sheet overlays use the `scrim` role, at MD3's 32% opacity.
