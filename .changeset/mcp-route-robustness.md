---
'@pmndrs/docs': patch
---

The MCP server at `/api/mcp` now answers browser preflights and sends CORS headers, answers an empty or malformed JSON body with a 400 parse error instead of hanging until the function times out, and logs one line for every request it refuses.
