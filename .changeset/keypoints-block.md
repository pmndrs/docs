---
'@pmndrs/docs': minor
---

`Keypoints` is now a shadcn registry block, installable into any app with `npx shadcn@latest add pmndrs/docs/keypoints`. It is the first pmndrs block to be distributed this way, and the first to depend on the shared colour layer across registries — `pmndrs/design-system/md3`, for the one MD3 role it uses that shadcn has no equivalent for.

Being distributable is what drove the three changes to it. It reached into this app's MDX component map for the list wrappers, so those are inlined; it imported `cn` through a path `components.json` does not alias, so the whole app is standardized on `@/lib/utils` and the duplicate `src/lib/cn.ts` is gone; and it painted its border with `border-outline-variant`, which is `border-border` by another name, so it now uses the stock token and keeps `bg-surface-dim` as the single deliberate MD3 reach.

Nothing changes for authors: the same `<Keypoints>` / `<KeypointsItem>` in the same MDX, rendering the same. The source moved from `src/components/mdx/Keypoints/` to `registry/keypoints/`, alongside `registry.json` at the root.
