import { NextResponse } from 'next/server'
import { libs } from '@/app/page'

export const dynamic = 'force-static'

export async function GET() {
  // Extract library information dynamically from libs
  const libraryList = Object.entries(libs)
    .map(([key, lib]) => `- **${key}** - ${lib.description}`)
    .join('\n')

  const content = `# PMNDRS Documentation MCP Server

## Overview

This MCP (Model Context Protocol) server provides programmatic access to documentation for all pmndrs libraries through surgical queries. It enables AI agents to efficiently retrieve specific documentation pages without downloading entire sites.

## Supported Libraries

The server supports all pmndrs ecosystem libraries including:
${libraryList}

## Available Resources

### 1. \`docs://pmndrs/manifest\`
This skill manifest - provides an overview of the server, its capabilities, and usage guidelines.

### 2. \`docs://{lib}/index\`
Index of available documentation pages for each library. Each library has its own index resource:
- \`docs://zustand/index\` - Zustand documentation index
- \`docs://jotai/index\` - Jotai documentation index
- \`docs://valtio/index\` - Valtio documentation index
- And similarly for all other supported libraries

**Output format:**
Each line contains: \`{page_path} - {page_title}\`

**Example:**
\`\`\`
/docs/guides/typescript - TypeScript Guide
/docs/api/create - create API
/docs/guides/auto-generating-selectors - Auto-generating Selectors
\`\`\`

## Available Tools

### 1. \`get_page_content\`
Retrieves the full content of a specific documentation page.

**Input:**
- \`lib\` (string): The library name
- \`path\` (string): The page path (e.g., "/docs/guides/typescript")

**Output:**
- The full markdown content of the requested page

**Example usage:**
\`\`\`
Use get_page_content with lib="zustand" and path="/docs/guides/typescript" to get the TypeScript guide
\`\`\`

## Best Practices

### Efficient Querying
1. **Always start with library index resources** (e.g., \`docs://zustand/index\`) to discover available documentation before requesting specific pages
2. **Use resource URIs** to access page indexes - they're more efficient than tool calls for listing content
3. **Use specific page paths** rather than trying to guess URLs

### Understanding the Content
1. Documentation is returned as **raw markdown text**
2. Code examples are included inline with syntax highlighting markers
3. Each page is self-contained and focuses on a specific topic

### Working with Libraries
1. Library names are **case-sensitive** (use exact names as listed above)
2. Internal routes (like \`/zustand\`) are automatically resolved to \`https://docs.pmnd.rs/zustand\`
3. External library documentation is fetched from their respective domains

## Error Handling

The server provides clear error messages for common issues:
- **Unknown library**: The specified library name doesn't exist
- **Page not found**: The requested path doesn't exist for that library
- **Network errors**: Connectivity issues fetching documentation

Always handle errors gracefully and consider alternative approaches when a specific page isn't available.

## Resource URI Scheme

Resources use the \`docs://\` URI scheme:
- \`docs://pmndrs/manifest\` - This skill manifest document
- \`docs://{lib}/index\` - Page index for each library (e.g., \`docs://zustand/index\`)

## Technical Notes

### Architecture
- Built with \`mcp-handler\` for Vercel deployment
- Uses Server-Sent Events (SSE) transport at \`/api/sse\`
- HTTP streamable transport available at \`/api/mcp\`
- Documentation is parsed from XML-tagged full-text dumps (\`/llms-full.txt\`)

### Security
- CSS selector injection protection via \`.filter()\` instead of direct selectors
- Input validation with Zod schemas
- No arbitrary URL fetching - only approved pmndrs libraries

### Performance
- 60-second timeout for tool executions
- Minimal payload - only requested pages are transferred
- XML parsing with Cheerio for efficient text extraction

## Getting Started

1. Connect to the server at \`https://docs.pmnd.rs/api/sse\`
2. Read \`docs://pmndrs/manifest\` to understand server capabilities
3. Access \`docs://{lib}/index\` to discover available documentation for a library
4. Request specific pages with \`get_page_content\` tool
5. Combine information from multiple pages to provide comprehensive answers

## Example Workflow

\`\`\`
1. User asks: "How do I use TypeScript with Zustand?"

2. Agent thinks: I should check what Zustand documentation is available
   → Read resource docs://zustand/index
   → Discover there's a "/docs/guides/typescript - TypeScript Guide" page

3. Agent retrieves content:
   → Call tool get_page_content(lib="zustand", path="/docs/guides/typescript")
   
4. Agent synthesizes answer from the documentation content
\`\`\`

## Notes

- Documentation is always current (fetched in real-time)
- No local caching - always retrieves fresh content
- Suitable for both simple queries and comprehensive research
`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  })
}
