# Local MCP Server for pmndrs Docs

This script provides offline access to pmndrs documentation through a local MCP (Model Context Protocol) server.

## Overview

- **Remote MCP Server** (`/mcp` route): Works online, fetches docs from live URLs
- **Local MCP Server** (`npx @pmndrs/docs mcp-local`): Works offline, reads from built documentation

## Usage

### Prerequisites

First, build the documentation:

```bash
npm run build
```

This generates the static site in the `out/` directory with all `llms-full.txt` files.

### Running the Local Server

```bash
npx @pmndrs/docs mcp-local
```

Or if installed globally:

```bash
npm install -g @pmndrs/docs
mcp-local
```

### Configuration for AI Clients

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "pmndrs-local": {
      "command": "npx",
      "args": ["@pmndrs/docs", "mcp-local"]
    }
  }
}
```

## Available Tools

### `list_pages`

List all available documentation pages for a library.

**Input:**
- `lib` (string): Library name (e.g., "zustand", "jotai", "valtio")

**Output:**
- List of page paths, one per line

**Example:**
```json
{
  "lib": "zustand"
}
```

### `get_page_content`

Get the full content of a specific documentation page.

**Input:**
- `lib` (string): Library name
- `path` (string): Page path (e.g., "/docs/api/hooks/use-frame")

**Output:**
- Full markdown content of the page

**Example:**
```json
{
  "lib": "zustand",
  "path": "/docs/getting-started/introduction"
}
```

## Limitations

The local server only works with **internal libraries** (those with `/` prefixed URLs):
- ✅ zustand, jotai, valtio, a11y, react-postprocessing, uikit, xr, leva
- ❌ react-three-fiber, react-spring, drei, prai, viverse (these use external URLs)

For external libraries, use the remote MCP server at `https://docs.pmnd.rs/mcp`.

## Architecture

The local server:
1. Reads built `llms-full.txt` files from the `out/` directory
2. Parses `<page>` tags using Cheerio (same as remote server)
3. Provides the same tools and interface as the remote server
4. Uses stdio transport for MCP communication

This ensures **100% logic reuse** between local and remote implementations.

## Troubleshooting

### "Failed to read local llms-full.txt"

Make sure you've built the project first:

```bash
npm run build
```

### "Library uses external URL"

The library you're trying to access is hosted externally. Use the remote MCP server instead:

```bash
# Use remote server for external libraries
curl -N https://docs.pmnd.rs/mcp
```

### "No local libraries available"

The build output directory doesn't exist or is empty. Run:

```bash
npm run build
```
