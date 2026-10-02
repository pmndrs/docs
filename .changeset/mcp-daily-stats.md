---
'@pmndrs/docs': minor
---

feat: daily counters of the MCP server's use, shown under the live view at `/mcp/live` and served as JSON at `/mcp/live/stats`. Per UTC day: connections (handshakes), by client; tool calls, by tool and library; resource reads; errors. Kept 400 days in Redis, where the platform's logs are kept a day.
