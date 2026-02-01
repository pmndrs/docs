# PMNDRS Documentation MCP Server

## Overview

This MCP (Model Context Protocol) server provides programmatic access to documentation for all pmndrs libraries through surgical queries. It enables AI agents to efficiently retrieve specific documentation pages without downloading entire sites.

## Supported Libraries

The server supports all pmndrs ecosystem libraries including:
- **react-three-fiber** - React renderer for Three.js
- **drei** - Useful helpers for react-three-fiber
- **react-spring** - Spring-physics based animation library
- **zustand** - Bear necessities for state management
- **jotai** - Primitive and flexible state management
- **valtio** - Proxy-state made simple
- **a11y** - Accessibility tools
- **react-postprocessing** - Postprocessing effects
- **uikit** - UI components for React Three Fiber
- **xr** - VR/AR components
- **prai** - AI components
- **viverse** - Metaverse components
- **leva** - GUI controls

## Available Tools

### 1. `list_pages`
Lists all available documentation pages for a specific library.

**Input:**
- `lib` (string): The library name (e.g., "zustand", "drei", "react-three-fiber")

**Output:**
- A list of page paths, one per line

**Example usage:**
```
Use list_pages with lib="zustand" to see all available Zustand documentation pages
```

### 2. `get_page_content`
Retrieves the full content of a specific documentation page.

**Input:**
- `lib` (string): The library name
- `path` (string): The page path (e.g., "/docs/guides/typescript")

**Output:**
- The full markdown content of the requested page

**Example usage:**
```
Use get_page_content with lib="zustand" and path="/docs/guides/typescript" to get the TypeScript guide
```

## Best Practices

### Efficient Querying
1. **Always start with `list_pages`** to discover available documentation before requesting specific pages
2. **Cache page lists** when possible to minimize redundant requests
3. **Use specific page paths** rather than trying to guess URLs

### Understanding the Content
1. Documentation is returned as **raw markdown text**
2. Code examples are included inline with syntax highlighting markers
3. Each page is self-contained and focuses on a specific topic

### Working with Libraries
1. Library names are **case-sensitive** (use exact names as listed above)
2. Internal routes (like `/zustand`) are automatically resolved to `https://docs.pmnd.rs/zustand`
3. External library documentation is fetched from their respective domains

## Error Handling

The server provides clear error messages for common issues:
- **Unknown library**: The specified library name doesn't exist
- **Page not found**: The requested path doesn't exist for that library
- **Network errors**: Connectivity issues fetching documentation

Always handle errors gracefully and consider alternative approaches when a specific page isn't available.

## Resource URI Scheme

Resources use the `docs://pmndrs/` URI scheme:
- `docs://pmndrs/manifest` - This skill manifest document

## Technical Notes

### Architecture
- Built with `mcp-handler` for Vercel deployment
- Uses Server-Sent Events (SSE) transport at `/api/sse`
- HTTP streamable transport available at `/api/mcp`
- Documentation is parsed from XML-tagged full-text dumps (`/llms-full.txt`)

### Security
- CSS selector injection protection via `.filter()` instead of direct selectors
- Input validation with Zod schemas
- No arbitrary URL fetching - only approved pmndrs libraries

### Performance
- 60-second timeout for tool executions
- Minimal payload - only requested pages are transferred
- XML parsing with Cheerio for efficient text extraction

## Getting Started

1. Connect to the server at `https://docs.pmnd.rs/api/sse`
2. Use `list_pages` to discover available documentation
3. Request specific pages with `get_page_content`
4. Combine information from multiple pages to provide comprehensive answers

## Example Workflow

```
1. User asks: "How do I use TypeScript with Zustand?"

2. Agent thinks: I should check what Zustand documentation is available
   → Call list_pages(lib="zustand")
   → Discover there's a "/docs/guides/typescript" page

3. Agent retrieves content:
   → Call get_page_content(lib="zustand", path="/docs/guides/typescript")
   
4. Agent synthesizes answer from the documentation content
```

## Notes

- Documentation is always current (fetched in real-time)
- No local caching - always retrieves fresh content
- Suitable for both simple queries and comprehensive research
