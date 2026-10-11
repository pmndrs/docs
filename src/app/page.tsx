import { GitHubIcon } from '@/components/brand-icons'
import { Code } from '@/components/mdx/Code/Code'
import { Gha } from '@/components/mdx/Gha/Gha'
import { LibIcon } from '@/components/LibIcon'
import { McpInstall } from '@/components/McpInstall/McpInstall'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { libs } from '@/libs'
import { FileTextIcon } from 'lucide-react'
import { svg } from '@/utils/icon'
import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const title = 'Poimandres documentation'
const description = `Index of documentation for pmndrs/* libraries`
const icon = []
if (process.env.ICON) {
  icon.push({
    url: `data:image/svg+xml,${encodeURIComponent(svg('🖨️'))}`,
  })
}

export const metadata: Metadata = {
  title,
  description,
  icons: {
    icon,
  },
  openGraph: {
    title,
    description,
    images: [{ url: '/logo.png' }],
  },
}

export default function Page() {
  const HOME_REDIRECT = process.env.HOME_REDIRECT
  if (HOME_REDIRECT) redirect(HOME_REDIRECT)

  return (
    <>
      <div className="min-h-screen">
        <div className="px-4 py-8 pb-12 lg:px-28 lg:py-12 lg:pb-20">
          <header className="text-center text-3xl lg:text-left">
            <Link href="/" aria-label="Poimandres Docs" className="font-bold">
              <span className="sm:hidden">docs</span>
              <span className="hidden sm:inline">documentation</span>
            </Link>
            .<Link href="https://pmnd.rs">pmnd.rs</Link>
          </header>

          <section className="mt-8 lg:mt-10">
            <Gha keyword="TIP" title="MCP-server">
              <div className="text-sm leading-relaxed!">
                Browse these docs from your{' '}
                <a
                  href="https://modelcontextprotocol.io/docs/develop/connect-remote-servers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  MCP-compatible client
                </a>
                , e.g. claude-code :
              </div>
              <Code className="language-bash">
                <code className="language-bash">{`/plugin marketplace add pmndrs/claude-code-plugin
/plugin install pmndrs@pmndrs`}</code>
              </Code>
              <McpInstall />
              <p className="mt-4 text-sm leading-relaxed!">
                Each lib also exposes its{' '}
                <code>
                  <a
                    href="https://pmndrs.github.io/react-three-fiber/llms.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    llms.txt
                  </a>
                </code>{' '}
                /{' '}
                <code>
                  <a
                    href="https://pmndrs.github.io/react-three-fiber/llms-full.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    llms-full.txt
                  </a>
                </code>{' '}
              </p>
            </Gha>
          </section>

          <main className="max-w-8xl mt-8 grid w-full grid-cols-1 gap-8 lg:mt-10 lg:grid-cols-2 lg:gap-12 2xl:grid-cols-3">
            {Object.entries(libs).map(([id, data]) => {
              return (
                <Card key={id} role="group" aria-labelledby={`library-${id}`} className="min-w-0">
                  <CardHeader className="flex-1">
                    <CardTitle className="flex flex-wrap items-center gap-2">
                      <h2 id={`library-${id}`}>{data.title}</h2>
                      {'llms_full' in data && data.llms_full && (
                        <Badge
                          variant="secondary"
                          title={`Reachable from an MCP client as lib="${id}" -- see its requests live`}
                          render={<Link href={`/mcp/live?lib=${encodeURIComponent(id)}`} />}
                        >
                          MCP
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="max-w-md">{data.description}</CardDescription>
                    <CardAction>
                      <a
                        href={data.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${data.title} on GitHub`}
                        className="relative block size-20 shrink-0"
                      >
                        <LibIcon
                          id={id as keyof typeof libs}
                          size={80}
                          className="absolute inset-0 size-full grayscale transition group-hover/card:grayscale-0"
                        />
                      </a>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      nativeButton={false}
                      render={<Link href={data.docs_url} />}
                    >
                      <FileTextIcon data-icon="inline-start" />
                      <span className="sm:hidden">Docs</span>
                      <span className="hidden sm:inline">Documentation</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      nativeButton={false}
                      render={<a href={data.github} target="_blank" rel="noopener noreferrer" />}
                    >
                      <GitHubIcon data-icon="inline-start" />
                      GitHub
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </main>
        </div>
      </div>
    </>
  )
}
