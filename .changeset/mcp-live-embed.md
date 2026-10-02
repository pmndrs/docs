---
'@pmndrs/docs': patch
---

The live view of the MCP server's requests, on the Agents page, no longer 404s on a static
export. `/mcp/live` is server-only, so a static export now embeds and links to the one
docs.pmnd.rs serves, while `next dev` and docs.pmnd.rs keep their own, under `BASE_PATH`. It is
an MDX component, `<McpLiveEmbed />`.
