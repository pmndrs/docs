import type { Root } from 'hast'
import { visit } from 'unist-util-visit'

/** The page docs embed with `<iframe src="https://docs.pmnd.rs/mcp/live?embed">`. */
export const MCP_LIVE_URL = 'https://docs.pmnd.rs/mcp/live'

/**
 * Points `<iframe>`s at `/mcp/live` on this very server, where it has one.
 *
 * The docs write the absolute URL, which is what every static export needs: `/mcp/live` is left
 * out of it (see next-build.sh). A server build serves the page itself, though -- `next dev`, and
 * every Vercel deployment, previews included -- and there the embed should show that server's
 * requests, not production's. So it is rewritten to `${basePath}/mcp/live...`.
 *
 * @param basePath - the app's `basePath`; `undefined` leaves every URL as written
 */
export function rehypeMcpLiveIframe(basePath: string | undefined) {
  const rewrite = (src: unknown) =>
    typeof src === 'string' && basePath !== undefined && isMcpLive(src)
      ? `${basePath}/mcp/live${src.slice(MCP_LIVE_URL.length)}`
      : src

  return () => (tree: Root) => {
    if (basePath === undefined) return

    visit(tree, null, (node) => {
      // Markdown-made HTML, and an `<iframe>` written as JSX in MDX
      if ('tagName' in node && node.tagName === 'iframe') {
        node.properties.src = rewrite(node.properties.src) as string
      }
      if ('name' in node && node.name === 'iframe' && 'attributes' in node) {
        for (const attribute of node.attributes) {
          if ('name' in attribute && attribute.name === 'src') {
            attribute.value = rewrite(attribute.value) as typeof attribute.value
          }
        }
      }
    })
  }
}

function isMcpLive(src: string) {
  if (!src.startsWith(MCP_LIVE_URL)) return false
  // `/mcp/live`, `/mcp/live?embed`, `/mcp/live#...` -- not `/mcp/livestream`
  const rest = src.slice(MCP_LIVE_URL.length)
  return rest === '' || rest.startsWith('?') || rest.startsWith('#') || rest.startsWith('/')
}

/**
 * Whether this render is a server build's: running in Next (not the CLI's fragment renderer,
 * which has no server at all), and not for a static export.
 */
export function servesMcpLive(env: Record<string, string | undefined> = process.env) {
  return env.NEXT_RUNTIME !== undefined && env.OUTPUT !== 'export'
}
