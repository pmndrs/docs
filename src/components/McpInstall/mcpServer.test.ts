import { describe, expect, it } from 'vitest'
import {
  claudeCodeCommand,
  codexCommand,
  cursorInstallUrl,
  geminiCommand,
  grokCommand,
  MCP_NAME,
  MCP_URL,
  mcpServersJson,
  vscodeInstallUrl,
} from './mcpServer'

describe('cursorInstallUrl', () => {
  it('carries the server config, base64-encoded, under the server name', () => {
    const href = cursorInstallUrl()
    const url = new URL(href)

    expect(url.protocol).toBe('cursor:')
    expect(href.startsWith('cursor://anysphere.cursor-deeplink/mcp/install?')).toBe(true)
    expect(url.searchParams.get('name')).toBe(MCP_NAME)
    expect(JSON.parse(atob(url.searchParams.get('config')!))).toEqual({ url: MCP_URL })
  })

  it('builds from the given name and URL', () => {
    const url = new URL(cursorInstallUrl('acme', 'https://example.com/mcp'))

    expect(url.searchParams.get('name')).toBe('acme')
    expect(JSON.parse(atob(url.searchParams.get('config')!))).toEqual({
      url: 'https://example.com/mcp',
    })
  })
})

describe('vscodeInstallUrl', () => {
  it('carries the named server config, URL-encoded, as the whole query', () => {
    const href = vscodeInstallUrl()
    const [prefix, query] = href.split('?')

    expect(prefix).toBe('vscode:mcp/install')
    expect(JSON.parse(decodeURIComponent(query))).toEqual({
      name: MCP_NAME,
      type: 'http',
      url: MCP_URL,
    })
  })

  it('targets Insiders on request', () => {
    expect(vscodeInstallUrl({ insiders: true }).startsWith('vscode-insiders:mcp/install?')).toBe(
      true,
    )
  })
})

describe('snippets', () => {
  it('derive from the same name and URL', () => {
    expect(claudeCodeCommand()).toBe(`claude mcp add --transport http ${MCP_NAME} ${MCP_URL}`)
    expect(codexCommand()).toBe(`codex mcp add ${MCP_NAME} --url ${MCP_URL}`)
    expect(geminiCommand()).toBe(`gemini mcp add --transport http ${MCP_NAME} ${MCP_URL}`)
    expect(grokCommand()).toBe(`grok mcp add --transport http ${MCP_NAME} ${MCP_URL}`)
    expect(JSON.parse(mcpServersJson())).toEqual({
      mcpServers: { [MCP_NAME]: { type: 'http', url: MCP_URL } },
    })
  })
})
