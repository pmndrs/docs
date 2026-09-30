---
'@pmndrs/docs': patch
---

Keep MDX expressions again. next-mdx-remote 6 compiles with `blockJS: true` by default, which
silently stripped every `{...}` — `<Grid cols={2}>`, `<Sandpack files={{...}}>`,
`<Codesandbox tags={[...]}>` — since 3.4.2, and crashed builds whose Sandpack lost its `files`.
The MDX is the consuming repo's own docs, read at build time, so `blockJS` is turned off;
`blockDangerousJS` stays on.
