import { parseDocsMetadata } from '@/utils/docs'

export const dynamic = 'force-static'

export async function GET() {
  const { MDX, NEXT_PUBLIC_LIBNAME, NEXT_PUBLIC_URL } = process.env
  if (!MDX) throw new Error('MDX env var not set')
  if (!NEXT_PUBLIC_LIBNAME) throw new Error('NEXT_PUBLIC_LIBNAME env var not set')

  const docs = await parseDocsMetadata(MDX)

  const baseUrl = NEXT_PUBLIC_URL || ''

  // Generate llms.txt content following standard format
  const content = `# ${NEXT_PUBLIC_LIBNAME}

## Documentation

${docs
  .map((doc) => {
    const url = baseUrl ? `${baseUrl}${doc.url}` : doc.url
    return `- [${doc.title}](${url})${doc.description ? `: ${doc.description}` : ''}`
  })
  .join('\n')}

## MCP Server

This documentation is available via Model Context Protocol (MCP) server at https://docs.pmnd.rs/api/sse

Configure in your MCP client:
\`\`\`json
{
  "mcpServers": {
    "pmndrs": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/client-sse", "https://docs.pmnd.rs/api/sse"]
    }
  }
}
\`\`\`

---

For full documentation content, see ${baseUrl}/llms-full.txt
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
