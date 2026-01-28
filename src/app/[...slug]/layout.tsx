import * as React from 'react'

import { LayoutAside, LayoutContent, LayoutHeader } from '@/components/Layout'
import { NavContent } from '@/components/Nav/NavSidebar'
import Search from '@/components/Search'
import { Toc } from '@/components/mdx/Toc'
import cn from '@/lib/cn'
import { getData } from '@/utils/docs'
import Link from 'next/link'
import { PiDiscordLogoLight } from 'react-icons/pi'
import { VscGithubAlt } from 'react-icons/vsc'
import { DocsContext } from './DocsContext'
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

export type Props = {
  params: Promise<{ slug: string[] }>
  children: React.ReactNode
}

export default async function Layoutt({ params, children }: Props) {
  const { slug } = await params
  const { docs, doc } = await getData(...slug)

  const asPath = slug.join('/')

  const currentPageIndex = docs.findIndex(({ url }) => url === `/${asPath}`)
  const currentPage = docs[currentPageIndex]
  const previousPage = currentPageIndex > 0 && docs[currentPageIndex - 1]
  const nextPage = currentPageIndex < docs.length - 1 && docs[currentPageIndex + 1]

  const NEXT_PUBLIC_LIBNAME = process.env.NEXT_PUBLIC_LIBNAME
  const NEXT_PUBLIC_LIBNAME_SHORT = process.env.NEXT_PUBLIC_LIBNAME_SHORT
  const NEXT_PUBLIC_LIBNAME_DOTSUFFIX_LABEL = process.env.NEXT_PUBLIC_LIBNAME_DOTSUFFIX_LABEL
  const NEXT_PUBLIC_LIBNAME_DOTSUFFIX_HREF = process.env.NEXT_PUBLIC_LIBNAME_DOTSUFFIX_HREF

  const header = (
    <div className="flex h-(--header-height) items-center gap-(--rgrid-m) px-(--rgrid-m)">
      <SidebarTrigger className="lg:hidden" />
      <div className="flex items-center">
        <Link href="/" aria-label={`${NEXT_PUBLIC_LIBNAME} Docs`}>
          <span className="font-bold">
            {NEXT_PUBLIC_LIBNAME_SHORT && (
              <span className="inline lg:hidden">{NEXT_PUBLIC_LIBNAME_SHORT}</span>
            )}
            <span className={cn(NEXT_PUBLIC_LIBNAME_SHORT ? 'hidden' : undefined, 'lg:inline')}>
              {NEXT_PUBLIC_LIBNAME}
            </span>
          </span>
        </Link>
        {NEXT_PUBLIC_LIBNAME_DOTSUFFIX_LABEL ? (
          <span className="font-normal">
            .
            {NEXT_PUBLIC_LIBNAME_DOTSUFFIX_HREF ? (
              <a href={NEXT_PUBLIC_LIBNAME_DOTSUFFIX_HREF}>{NEXT_PUBLIC_LIBNAME_DOTSUFFIX_LABEL}</a>
            ) : (
              NEXT_PUBLIC_LIBNAME_DOTSUFFIX_LABEL
            )}
          </span>
        ) : null}
      </div>

      <Search className="grow" />

      <div className="flex">
        {[
          { href: process.env.GITHUB, icon: <VscGithubAlt /> },
          { href: process.env.DISCORD, icon: <PiDiscordLogoLight /> },
        ].map(({ href, icon }, index) => (
          <React.Fragment key={index}>
            {href && (
              <Link
                href={href}
                className={cn('hidden size-9 items-center justify-center lg:flex')}
                target="_blank"
              >
                {icon}
              </Link>
            )}
          </React.Fragment>
        ))}
        {/* <ToggleTheme className="hidden size-9 items-center justify-center sm:flex" /> */}
      </div>
    </div>
  )
  const footer = (
    <>
      {(!!currentPage || doc.sourcecode) && (
        <div className="my-24">
          <div className="flex flex-col gap-4 text-right">
            {doc.sourcecode && (
              <p>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'mb-2 text-base hover:underline',
                    'font-mono text-on-surface-variant/50',
                  )}
                  href={doc.sourcecodeURL || '#no-sourcecode-url'}
                >
                  {doc.sourcecode}
                </a>
              </p>
            )}

            {!!currentPage && (
              <p>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn('mb-2 text-base hover:underline', 'text-on-surface-variant/50')}
                  href={currentPage.editURL || '#no-edit-url'}
                >
                  Edit this page
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {(!!previousPage || !!nextPage) && (
        <nav className="my-16 lg:my-32">
          <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
            {!!previousPage && (
              <div className="">
                <label
                  className={cn(
                    'mb-2 text-xs font-bold uppercase leading-4',
                    'text-on-surface-variant/50',
                  )}
                >
                  Previous
                </label>
                <div className="text-xl">
                  <Link href={previousPage.url} rel="prev">
                    {previousPage.title}
                  </Link>
                </div>
              </div>
            )}
            {!!nextPage && (
              <div className="ml-auto text-right">
                <label
                  className={cn(
                    'mb-2 text-xs font-bold uppercase leading-4',
                    'text-on-surface-variant/50',
                  )}
                >
                  Next
                </label>
                <div className="text-xl">
                  <Link href={nextPage.url} rel="next">
                    {nextPage.title}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>
      )}
    </>
  )

  const toc = <Toc toc={doc.tableOfContents.filter(({ level }) => level > 0)} />

  return (
    <>
      <DocsContext value={{ docs, doc }}>
        <TooltipProvider>
          <SidebarProvider>
            <Sidebar collapsible="offcanvas">
              <NavContent docs={docs} asPath={asPath} />
            </Sidebar>
            <SidebarInset className="flex min-h-dvh flex-col">
              <LayoutHeader className="z-10 border-b border-outline-variant/50 bg-surface/95 backdrop-blur-xl sticky top-0">
                {header}
              </LayoutHeader>
              <div className="flex flex-1">
                <LayoutContent className="lg:mr-(--rgrid-m) xl:mr-0">
                  <article className="post-container">
                    {children}
                    {footer}
                  </article>
                </LayoutContent>
                <LayoutAside className="pt-8 hidden xl:block sticky top-(--header-height) h-[calc(100dvh-var(--header-height))] overflow-auto">
                  {toc}
                </LayoutAside>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </DocsContext>
    </>
  )
}
