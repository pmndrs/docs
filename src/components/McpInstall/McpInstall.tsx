import { Code } from '@/components/mdx/Code/Code'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/mdx/Tabs/Tabs'
import { Button } from '@/components/ui/button'
import { PlugIcon } from 'lucide-react'
import {
  claudeCodeCommand,
  codexCommand,
  cursorInstallUrl,
  geminiCommand,
  grokCommand,
  mcpServersJson,
  MCP_NAME,
  MCP_URL,
  vscodeInstallUrl,
} from './mcpServer'

/**
 * How to add the pmndrs MCP server to each client: one-click install links for the clients that
 * have a deeplink (Cursor, VS Code), a one-liner or a short recipe for the others, one tab each.
 * Every address comes from `mcpServer.ts`.
 */
export function McpInstall() {
  return (
    <>
      <div className="my-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-on-surface-variant">One click:</span>
        <InstallLink href={cursorInstallUrl()}>Add to Cursor</InstallLink>
        <InstallLink href={vscodeInstallUrl()}>Add to VS Code</InstallLink>
        <InstallLink href={vscodeInstallUrl({ insiders: true })}>
          Add to VS Code Insiders
        </InstallLink>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer">Other clients</summary>
        <Tabs defaultValue="claude-code" syncKey="mcp-client" className="my-2">
          {/* One line, scrolling sideways when the tabs don't fit, its overflowing edge fading out
              (shadcn's `scroll-fade-x`, as the `Code` block's scroller). The bottom padding keeps
              the active tab's underline, drawn below the tab, inside the scroller's clip. */}
          <TabsList
            aria-label="MCP client"
            className="flex-nowrap overflow-x-auto pb-1.5 scroll-fade-x no-scrollbar"
          >
            <TabsTrigger value="claude-code" className="text-sm">
              Claude Code
            </TabsTrigger>
            <TabsTrigger value="codex" className="text-sm">
              Codex
            </TabsTrigger>
            <TabsTrigger value="gemini" className="text-sm">
              Gemini CLI
            </TabsTrigger>
            <TabsTrigger value="grok" className="text-sm">
              grok CLI
            </TabsTrigger>
            <TabsTrigger value="claude" className="text-sm">
              Claude.ai / Desktop
            </TabsTrigger>
            <TabsTrigger value="chatgpt" className="text-sm">
              ChatGPT
            </TabsTrigger>
            <TabsTrigger value="json" className="text-sm">
              JSON config
            </TabsTrigger>
          </TabsList>
          <TabsContent value="claude-code" className="text-sm">
            <p className="mt-3">Without the plugin, from your terminal:</p>
            <Snippet language="bash">{claudeCodeCommand()}</Snippet>
          </TabsContent>
          <TabsContent value="codex" className="text-sm">
            <p className="mt-3">
              From your terminal (writes the server to <code>~/.codex/config.toml</code>):
            </p>
            <Snippet language="bash">{codexCommand()}</Snippet>
          </TabsContent>
          <TabsContent value="gemini" className="text-sm">
            <p className="mt-3">From your terminal:</p>
            <Snippet language="bash">{geminiCommand()}</Snippet>
          </TabsContent>
          <TabsContent value="grok" className="text-sm">
            <p className="mt-3">
              From your terminal (writes the server to <code>~/.grok/config.toml</code>):
            </p>
            <Snippet language="bash">{grokCommand()}</Snippet>
          </TabsContent>
          <TabsContent value="claude" className="text-sm">
            <p className="mt-3">
              <b>Customize</b> &gt; <b>Connectors</b> &gt; <b>Add custom connector</b>: name it{' '}
              <code>{MCP_NAME}</code>, paste the server URL, no authentication:
            </p>
            <Snippet language="text">{MCP_URL}</Snippet>
          </TabsContent>
          <TabsContent value="chatgpt" className="text-sm">
            <p className="mt-3">
              Turn on <b>Developer mode</b> (<b>Settings</b> &gt; <b>Security and login</b>), then
              on{' '}
              <a
                href="https://chatgpt.com/plugins"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                chatgpt.com/plugins
              </a>{' '}
              create an app named <code>{MCP_NAME}</code> with the server URL, no authentication:
            </p>
            <Snippet language="text">{MCP_URL}</Snippet>
          </TabsContent>
          <TabsContent value="json" className="text-sm">
            <p className="mt-3">
              For any client that reads an <code>mcpServers</code> JSON (Claude Desktop, Cursor,
              Windsurf...):
            </p>
            <Snippet language="json">{mcpServersJson()}</Snippet>
          </TabsContent>
        </Tabs>
      </details>
    </>
  )
}

/** A compact install link, styled as a small filled button, to stand out on the callout */
function InstallLink({ href, children }: { href: string; children: string }) {
  return (
    <Button
      variant="default"
      size="sm"
      nativeButton={false}
      render={<a href={href} rel="noopener" />}
    >
      <PlugIcon data-icon="inline-start" />
      {children}
    </Button>
  )
}

/** A code block with the copy button, as the MDX ones */
function Snippet({ language, children }: { language: string; children: string }) {
  return (
    <Code className={`language-${language}`}>
      <code className={`language-${language}`}>{children}</code>
    </Code>
  )
}
