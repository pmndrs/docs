---
'@pmndrs/docs': patch
---

Markdown export: with a path-only `MDX_BASEURL` (e.g. `/react-three-fiber`), relative images (`![]()`, `<img>`, `<Img>`) were resolved twice and came out with the base path doubled. They are now resolved once.
