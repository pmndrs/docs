import { a as Link } from '@/components/mdx'

/**
 * The URL of the MCP live view, `src/app/mcp/live`.
 *
 * The view is server-only, so a static export has none of its own: it links to the one
 * docs.pmnd.rs serves. Anywhere else — `next dev`, docs.pmnd.rs itself — it is the app's own,
 * under its `basePath`, which an iframe `src` does not get by itself.
 */
function mcpLiveUrl() {
  if (process.env.OUTPUT === 'export') return 'https://docs.pmnd.rs/mcp/live'

  return `${process.env.BASE_PATH || ''}/mcp/live`
}

/**
 * The requests the pmndrs docs MCP server is serving, live: the compact `?embed` view, with a
 * link to the full one under it.
 */
export function McpLiveEmbed() {
  const url = mcpLiveUrl()

  return (
    <div>
      <iframe
        src={`${url}?embed`}
        title="MCP live: the requests the pmndrs docs MCP server is serving"
        loading="lazy"
        className="h-[36rem] w-full rounded-lg"
      />
      <p className="mt-1 text-xs text-on-surface-variant">
        The MCP server&apos;s requests, live — see the <Link href={url}>full view</Link>.
      </p>
    </div>
  )
}
