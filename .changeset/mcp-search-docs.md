---
'@pmndrs/docs': minor
---

The MCP server gains a `search_docs` tool: a query, optionally one library, and it answers with the best-matching pages -- ranked the way `npx @pmndrs/docs search` ranks them -- each with the `lib` and `path` to read it with `get_page_content`. Its tool descriptions and manifest now tell agents to search before answering, since the docs are newer than their training data.
