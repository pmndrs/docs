import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { McpLiveEmbed } from './McpLiveEmbed'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('McpLiveEmbed', () => {
  it("embeds the app's own view, under its basePath, where the app is served", () => {
    vi.stubEnv('OUTPUT', '')
    vi.stubEnv('BASE_PATH', '/docs')
    const html = renderToStaticMarkup(<McpLiveEmbed />)
    expect(html).toContain('<iframe src="/docs/mcp/live?embed"')
    expect(html).toMatch(/<a [^>]*href="\/docs\/mcp\/live"/)
  })

  it('embeds the view docs.pmnd.rs serves in a static export, which has none', () => {
    vi.stubEnv('OUTPUT', 'export')
    vi.stubEnv('BASE_PATH', '/docs')
    const html = renderToStaticMarkup(<McpLiveEmbed />)
    expect(html).toContain('<iframe src="https://docs.pmnd.rs/mcp/live?embed"')
    expect(html).toMatch(/<a [^>]*href="https:\/\/docs.pmnd.rs\/mcp\/live"[^>]*target="_blank"/)
  })
})
