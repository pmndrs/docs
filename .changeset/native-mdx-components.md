---
'@pmndrs/docs': minor
---

Add consumer configuration for local React components and shared MDX data. Register components and scope in `docs.config.ts`, or select a configuration with `--config` or `DOCS_CONFIG`, for website builds and HTML fragments. Website builds preserve Next's server and client component boundaries without rewriting MDX sources.

Require Node.js 22.18+ on the 22.x line, or 23.6+ on newer lines, so the Next configuration and shared configuration resolver can use native TypeScript.
