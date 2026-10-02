import { compileMDX } from 'next-mdx-remote/rsc'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { rehypeMcpLiveIframe, servesMcpLive } from './rehypeMcpLiveIframe'

async function render(source: string, basePath: string | undefined) {
  const { content } = await compileMDX({
    source,
    options: { mdxOptions: { rehypePlugins: [rehypeMcpLiveIframe(basePath)] } },
  })
  return renderToStaticMarkup(content)
}

const embed = '<iframe src="https://docs.pmnd.rs/mcp/live?embed" title="MCP live" />'

describe('rehypeMcpLiveIframe', () => {
  it('points the embed at this server', async () => {
    expect(await render(embed, '')).toContain('src="/mcp/live?embed"')
  })

  it('keeps the basePath', async () => {
    expect(await render(embed, '/docs')).toContain('src="/docs/mcp/live?embed"')
  })

  it('leaves the absolute URL where there is no server', async () => {
    expect(await render(embed, undefined)).toContain('src="https://docs.pmnd.rs/mcp/live?embed"')
  })

  it('leaves every other iframe alone', async () => {
    const html = await render(
      [
        '<iframe src="https://drei.pmnd.rs/iframe.html" />',
        '<iframe src="https://docs.pmnd.rs/mcp/livestream" />',
        '<iframe src="https://example.com/?u=https://docs.pmnd.rs/mcp/live" />',
      ].join('\n\n'),
      '',
    )
    expect(html).toContain('src="https://drei.pmnd.rs/iframe.html"')
    expect(html).toContain('src="https://docs.pmnd.rs/mcp/livestream"')
    expect(html).toContain('src="https://example.com/?u=https://docs.pmnd.rs/mcp/live"')
  })
})

describe('servesMcpLive', () => {
  it('is true in a Next server build only', () => {
    expect(servesMcpLive({ NEXT_RUNTIME: 'nodejs' })).toBe(true)
    expect(servesMcpLive({ NEXT_RUNTIME: 'nodejs', OUTPUT: 'export' })).toBe(false)
    // The CLI's fragments: no Next, no server
    expect(servesMcpLive({})).toBe(false)
  })
})
