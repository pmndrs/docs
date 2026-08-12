---
'@pmndrs/docs': patch
---

Pass the example gallery through as published rather than rendering it here. `pmndrs/examples` now writes the documents at build time and links each one from its page with `rel="alternate"`, so `examples://index` and `get_example` hand on the same text an agent would get from the open web — one rendering instead of two that could drift. The agents page documents both tools.
