---
'@pmndrs/docs': minor
---

`Color` and `ColorGroup` are now a shadcn registry block, installable into any app with `npx shadcn@latest add pmndrs/docs/color`. The second pmndrs block distributed this way, after `Keypoints`, and like it, it depends on the shared colour layer, `pmndrs/design-system/md3` — here for every swatch, since each one paints a `--md-sys-color-*` role.

Being distributable cost one change to it: `ColorGroup` knew this site's page wrapper, with a `[.post-container>&]:my-4` margin and a `grid!` that only beat the `.post-container > *` rule forcing `display: block`. Both move to this site's `globals.css`, keyed on the group's `data-slot`, so the component ships with neither the selector nor the `!important` — a consumer's `className` can lay out a group again — and a group has no margin of its own anywhere else.

Nothing changes for authors: the same `<Color>` / `<ColorGroup>` in the same MDX, rendering the same. The source moved from `src/components/mdx/Color/` to `registry/color/`, its stories and tests with it.
