import docsIcon from '@/assets/docs-icon.png'
import dreiIcon from '@/assets/drei-icon.svg'
import jotaiIcon from '@/assets/jotai-icon.png'
import ppIcon from '@/assets/pp-icon.svg'
import r3fIcon from '@/assets/r3f-icon.svg'
import reactSpringIcon from '@/assets/react-spring-icon.svg'
import uiKitIcon from '@/assets/uikit-icon.svg'
import zustandIcon from '@/assets/zustand-icon.svg'
import Icon from '@/components/Icon'
import { Code } from '@/components/mdx/Code/Code'
import { Gha } from '@/components/mdx/Gha/Gha'
import { Badge } from '@/components/ui/badge'
import { libs } from '@/libs'
import { svg } from '@/utils/icon'
import { Metadata } from 'next'
import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

/** The icons, kept here because they are assets: `@/libs` stays readable outside Next. */
const icons: Partial<Record<keyof typeof libs, StaticImageData>> = {
  'react-three-fiber': r3fIcon,
  'react-spring': reactSpringIcon,
  drei: dreiIcon,
  zustand: zustandIcon,
  jotai: jotaiIcon,
  'react-postprocessing': ppIcon,
  uikit: uiKitIcon,
  docs: docsIcon,
}

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
              <details className="text-sm">
                <summary className="cursor-pointer">Other clients (JSON config)</summary>
                <Code className="language-json">
                  <code className="language-json">{`{
  "mcpServers": {
    "pmndrs": {
      "type": "http",
      "url": "https://docs.pmnd.rs/api/mcp"
    }
  }
}`}</code>
                </Code>
              </details>
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
              const icon = icons[id as keyof typeof libs]

              return (
                <div
                  key={id}
                  className="group/card bg-surface-container relative overflow-hidden rounded-md border border-outline-variant font-normal"
                >
                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-6 px-6 py-6">
                      <div className="max-w-md">
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold">{data.title}</div>
                          {'llms_full' in data && data.llms_full && (
                            <Badge
                              variant="secondary"
                              title={`Reachable from an MCP client as lib="${id}"`}
                            >
                              MCP
                            </Badge>
                          )}
                        </div>
                        <div className="grow text-sm leading-relaxed! text-on-surface-variant/50">
                          {data.description}
                        </div>
                      </div>
                      {icon && (
                        <a
                          href={data.github}
                          target="_blank"
                          rel="noopener"
                          className="relative block h-20 w-20 shrink-0"
                        >
                          <Image
                            src={icon}
                            className="absolute inset-0 h-full w-full object-contain grayscale transition group-hover/card:grayscale-0"
                            alt={data.title}
                            aria-hidden
                          />
                        </a>
                      )}
                    </div>
                    <div className="flex w-full divide-x divide-outline-variant border-t border-outline-variant text-sm">
                      <Link
                        href={data.docs_url}
                        className="bg-surface-container inline-flex flex-1 items-center space-x-2 px-6 py-4 transition-colors"
                      >
                        <Icon icon="docs" />
                        <span className="sm:hidden">Docs</span>
                        <span className="hidden sm:inline">Documentation</span>
                      </Link>
                      <a
                        href={data.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-surface-container inline-flex flex-1 items-center space-x-2 px-6 py-4 transition-colors"
                      >
                        <Icon icon="github" />
                        <span>GitHub</span>
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </main>
        </div>
      </div>
    </>
  )
}
