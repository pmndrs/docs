---
'@pmndrs/docs': patch
---

Mermaid `block` / `block-beta` diagrams render again. They threw "Converting circular structure to JSON": mermaid's block layout eagerly `JSON.stringify`s a d3 selection whose `_parents` is `<html>`, and under React `<html>` carries enumerable, circular `__reactFiber$…` / `__reactProps$…` properties. The `Mermaid` component now gives `<html>` a non-enumerable `toJSON` before rendering, so it serializes like a plain element, as it does outside React. Upstream: mermaid-js/mermaid#5530, mermaid-js/mermaid#7907.
