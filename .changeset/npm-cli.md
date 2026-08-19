---
'@pmndrs/docs': minor
---

Publish the generator to npm, as `npx @pmndrs/docs build`.

`--format website` statically exports the documentation site, as the Docker image does.
`--format fragment` — the default — compiles MDX to plain HTML with no layout, stylesheet or
script, either from a folder or from stdin, and needs nothing but node.

`bin/build.mjs` is gone: it predated the Docker image, was never published, and built a server
bundle rather than a static export.
