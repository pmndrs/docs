//
// The pmndrs MCP server, and how each client adds it: deeplinks for the clients that have one,
// a one-liner or a config snippet for the others. Everything is derived from `MCP_NAME` and
// `MCP_URL`, so no client's recipe can drift from the server's address.
//

/** The server's name in a client's config */
export const MCP_NAME = 'pmndrs'

/** The server's address: a public, no-auth, streamable-HTTP MCP server */
export const MCP_URL = 'https://docs.pmnd.rs/api/mcp'

/** The server's entry, as the `mcpServers` JSON of most clients takes it */
export function mcpServerConfig(url = MCP_URL) {
  return { type: 'http', url } as const
}

/**
 * The `mcpServers` JSON config most clients accept (Claude Desktop's `claude_desktop_config.json`,
 * Cursor's `mcp.json`, Windsurf's `mcp_config.json`...), pretty-printed.
 */
export function mcpServersJson(name = MCP_NAME, url = MCP_URL) {
  return JSON.stringify({ mcpServers: { [name]: mcpServerConfig(url) } }, null, 2)
}

/**
 * Cursor's install deeplink: `cursor://anysphere.cursor-deeplink/mcp/install?name=...&config=...`,
 * `config` being the base64 of the server's JSON config (the entry, not the `mcpServers` wrapper).
 *
 * https://cursor.com/docs/mcp/install-links
 */
export function cursorInstallUrl(name = MCP_NAME, url = MCP_URL) {
  const config = btoa(JSON.stringify({ url }))
  const params = new URLSearchParams({ name, config })
  return `cursor://anysphere.cursor-deeplink/mcp/install?${params}`
}

/**
 * VS Code's install URL handler: `vscode:mcp/install?<url-encoded server JSON>`, the JSON holding
 * the server's `name` along with its config. `vscode-insiders:` for Insiders.
 *
 * https://code.visualstudio.com/docs/copilot/guides/mcp-developer-guide
 */
export function vscodeInstallUrl({
  insiders = false,
  name = MCP_NAME,
  url = MCP_URL,
}: { insiders?: boolean; name?: string; url?: string } = {}) {
  const scheme = insiders ? 'vscode-insiders' : 'vscode'
  const config = encodeURIComponent(JSON.stringify({ name, ...mcpServerConfig(url) }))
  return `${scheme}:mcp/install?${config}`
}

/**
 * Claude Code's one-liner, an alternative to the pmndrs plugin.
 *
 * https://code.claude.com/docs/en/mcp
 */
export function claudeCodeCommand(name = MCP_NAME, url = MCP_URL) {
  return `claude mcp add --transport http ${name} ${url}`
}

/**
 * Codex CLI's one-liner, writing the `[mcp_servers.<name>]` block of `~/.codex/config.toml`.
 *
 * https://developers.openai.com/codex/mcp
 */
export function codexCommand(name = MCP_NAME, url = MCP_URL) {
  return `codex mcp add ${name} --url ${url}`
}

/**
 * Gemini CLI's one-liner.
 *
 * https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md
 */
export function geminiCommand(name = MCP_NAME, url = MCP_URL) {
  return `gemini mcp add --transport http ${name} ${url}`
}

/**
 * xAI's grok CLI one-liner, writing the `[mcp_servers.<name>]` block of `~/.grok/config.toml`.
 *
 * https://docs.x.ai/build/features/mcp-servers
 */
export function grokCommand(name = MCP_NAME, url = MCP_URL) {
  return `grok mcp add --transport http ${name} ${url}`
}
