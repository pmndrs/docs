---
'@pmndrs/docs': minor
---

Serve the pmndrs example gallery over MCP, next to the docs: an `examples://index` resource listing every published demo with its description, libraries and tags, and a `get_example` tool returning one demo in full -- source files, the dependency versions it is written against, and asset attribution. Reads the JSON catalog pmndrs/examples publishes at `/catalog/`; override the origin with `EXAMPLES_URL` to develop against a local build.
