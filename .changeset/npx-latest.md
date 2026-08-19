---
'@pmndrs/docs': patch
---

Document `npx @pmndrs/docs@latest` rather than `npx @pmndrs/docs`. Without a version, `npx`
reuses whatever it already has in its cache, so a copy from weeks ago wins silently and the
command appears not to have changed.
