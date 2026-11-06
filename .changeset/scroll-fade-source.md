---
'@pmndrs/docs': patch
---

shadcn's `scroll-fade` utilities always emitted (directions, edges, `-none`, and sizes up to 24), so they work in docs that are not scanned for classes, as `MDX=/path pnpm dev`.
