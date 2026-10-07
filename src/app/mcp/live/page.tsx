import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { McpLive } from './_components/McpLive'
import { LiveView } from './LiveView'

/**
 * `/mcp/live`: what the MCP server at `/api/mcp` is being asked, as it happens.
 *
 * `/mcp/live?embed` is the same, compact and with no page around it, for an `<iframe>`: the
 * Agents docs page embeds it. Its background is transparent, so it takes on the page's; its theme
 * follows the page's on its own -- next-themes reads the same stored choice on the same origin,
 * and the same `prefers-color-scheme` anywhere.
 *
 * Left out of the static export and of the npm package, with its events endpoint (`./events`) and
 * along with `src/app/api` (see `next-build.sh`, `src/cli/website.ts` and the `files` of
 * `package.json`): it is docs.pmnd.rs's own page, beside the server it watches.
 */

export const metadata: Metadata = {
  title: 'MCP live',
  description: 'Requests to the pmndrs docs MCP server, live.',
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const basePath = process.env.BASE_PATH || ''

  if ('embed' in (await searchParams)) {
    return (
      <main className="p-1">
        {/* The root layout paints the body; an embed lets its host page show through */}
        <style>{'body { background-color: transparent !important; }'}</style>
        <McpLive variant="compact" basePath={basePath} />
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-8 lg:px-8 lg:py-12">
      <header className="flex flex-col gap-2">
        <Link href="/" className="text-sm text-on-surface-variant hover:underline">
          docs.pmnd.rs
        </Link>
        <h1 className="text-3xl font-bold">MCP live</h1>
        <p className="max-w-2xl text-on-surface-variant">
          Requests to the documentation MCP server, as they arrive: which client, which tool or
          resource, which library and page. Pick libraries to see their pages.
        </p>
      </header>

      {/* `useSearchParams` reads `?lib=` on the client */}
      <Suspense>
        <LiveView basePath={basePath} />
      </Suspense>
    </main>
  )
}
