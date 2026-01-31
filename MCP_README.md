# pmndrs MCP Server

Model Context Protocol (MCP) server for querying pmndrs library documentation.

## Overview

This MCP server provides surgical access to documentation across the pmndrs ecosystem. Instead of crawling messy HTML or downloading entire documentation sites, AI agents can use this server to:

1. List all available documentation pages for a library
2. Fetch specific page content on-demand

## Installation

```bash
npm install -g @pmndrs/docs
```

Or use directly with npx:

```bash
npx @pmndrs/docs mcp
```

## Usage

The MCP server runs over stdio and exposes two tools:

### 1. `list_pages`

Lists all available documentation paths for a library.

**Parameters:**

- `lib` (string, required): Library name. One of: `react-three-fiber`, `zustand`, `drei`, `viverse`

**Example:**

```json
{
  "name": "list_pages",
  "arguments": {
    "lib": "react-three-fiber"
  }
}
```

**Returns:**

```
/docs/api/hooks/use-frame
/docs/api/hooks/use-three
/docs/getting-started/introduction
...
```

### 2. `get_page_content`

Retrieves the full content of a specific documentation page.

**Parameters:**

- `lib` (string, required): Library name
- `path` (string, required): Page path (as returned by `list_pages`)

**Example:**

```json
{
  "name": "get_page_content",
  "arguments": {
    "lib": "react-three-fiber",
    "path": "/docs/api/hooks/use-frame"
  }
}
```

**Returns:**
The complete markdown content of the page, including URL, description, and main content.

## Supported Libraries

The server currently supports the following pmndrs libraries:

- `react-three-fiber` - https://r3f.docs.pmnd.rs
- `zustand` - https://zustand.docs.pmnd.rs
- `drei` - https://drei.docs.pmnd.rs
- `viverse` - https://pmndrs.github.io/viverse

## Adding to AI Agent Configurations

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pmndrs": {
      "command": "npx",
      "args": ["@pmndrs/docs", "mcp"]
    }
  }
}
```

### Cursor / Windsurf

Add to your MCP settings:

```json
{
  "pmndrs": {
    "command": "npx @pmndrs/docs mcp"
  }
}
```

## Architecture

The server works by:

1. Fetching `/llms-full.txt` from the library's documentation site
2. Parsing the XML-like `<page>` tags that wrap each documentation page
3. Using Cheerio to extract paths and content surgically

Each page in `llms-full.txt` is wrapped in a `<page>` tag with attributes:

```xml
<page path="/docs/api/hooks/use-frame" title="useFrame">
  [Clean Markdown Content]
</page>
```

This allows for efficient extraction without parsing the entire file.

## Registry

The library registry is maintained in `src/lib/registry.ts`. To add a new library:

1. Ensure the library has `/llms-full.txt` endpoint with `<page>` tag wrapping
2. Add an entry to the REGISTRY:

```typescript
'library-name': {
  url: 'https://library.docs.pmnd.rs',
  title: 'Library Name',
  description: 'Short description',
}
```

## Development

Run the server locally:

```bash
cd /path/to/pmndrs/docs
node bin/mcp.mjs
```

The server will start and listen for MCP requests on stdio.

## Future Enhancements

- **Skills Directory**: Library-specific best practices and patterns
- **Cross-Library Skills**: How to combine multiple pmndrs libraries
- **Auto-Discovery**: Automatically discover new libraries from the main registry
- **Caching**: Local caching of frequently accessed pages
