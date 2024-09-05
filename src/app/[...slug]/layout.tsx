import * as React from 'react'

import { Nav } from '@/components/Nav'
import Search from '@/components/Search'
import { Toc } from '@/components/mdx/Toc'
import cn from '@/lib/cn'
import { getData } from '@/utils/docs'
import Link from 'next/link'
import { PiDiscordLogoLight } from 'react-icons/pi'
import { VscGithubAlt } from 'react-icons/vsc'
import { DocsContext } from './DocsContext'

export type Props = {
  params: { slug: string[] }
  children: React.ReactNode
}

export default async function Layout({ params, children }: Props) {
  const slug = params.slug
  const { docs, doc } = await getData(...slug)

  const asPath = slug.join('/')

  const currentPageIndex = docs.findIndex(({ url }) => url === `/${asPath}`)
  const currentPage = docs[currentPageIndex]
  const previousPage = currentPageIndex > 0 && docs[currentPageIndex - 1]
  const nextPage = currentPageIndex < docs.length - 1 && docs[currentPageIndex + 1]

  const NEXT_PUBLIC_LIBNAME = process.env.NEXT_PUBLIC_LIBNAME
  const NEXT_PUBLIC_LIBNAME_SHORT = process.env.NEXT_PUBLIC_LIBNAME_SHORT

  const header = (
    <div className="flex h-16 items-center gap-[--rgrid-m] px-[--rgrid-m]">
      <div className="flex items-center">
        <Link href="/" aria-label="Poimandres Docs">
          <span className="font-bold">
            {NEXT_PUBLIC_LIBNAME_SHORT && (
              <span className="inline lg:hidden">{NEXT_PUBLIC_LIBNAME_SHORT}</span>
            )}
            <span className={cn(NEXT_PUBLIC_LIBNAME_SHORT ? 'hidden' : undefined, 'lg:inline')}>
              {NEXT_PUBLIC_LIBNAME}
            </span>
          </span>
        </Link>
        <span className="font-normal">
          .<a href="https://docs.pmnd.rs">docs</a>
        </span>
      </div>

      <Search />

      <div className="flex gap-0">
        {process.env.GITHUB && (
          <Link
            href={process.env.GITHUB}
            className="flex size-9 items-center justify-center"
            target="_blank"
          >
            <VscGithubAlt />
          </Link>
        )}
        {process.env.DISCORD && (
          <Link
            href={process.env.DISCORD}
            className="flex size-9 items-center justify-center"
            target="_blank"
          >
            <PiDiscordLogoLight />
          </Link>
        )}
        {/* <ToggleTheme className="hidden size-9 items-center justify-center sm:flex" /> */}
      </div>
    </div>
  )
  const footer = (
    <>
      {(!!currentPage || doc.sourcecode) && (
        <div className="my-24 flex flex-col gap-4 text-right">
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
      )}

      {(!!previousPage || !!nextPage) && (
        <nav className="my-32">
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
                  <Link href={previousPage.url}>{previousPage.title}</Link>
                </div>
              </div>
            )}
            {!!nextPage && (
              <div className="text-right">
                <label
                  className={cn(
                    'mb-2 text-xs font-bold uppercase leading-4',
                    'text-on-surface-variant/50',
                  )}
                >
                  Next
                </label>
                <div className="text-xl">
                  <Link href={nextPage.url}>{nextPage.title}</Link>
                </div>
              </div>
            )}
          </div>
        </nav>
      )}
    </>
  )
  const nav = <Nav docs={docs} asPath={asPath} />
  const toc = <Toc toc={doc.tableOfContents.filter(({ level }) => level > 0)} />

  return (
    <>
      <DocsContext value={{ docs, doc }}>
        {/* <MenuContext> */}
        <div className="[--side-w:theme(spacing.72)]">
          <header className="border-b border-outline-variant/50 bg-surface/95 backdrop-blur-xl">
            {header}
          </header>
          <div className="lg:flex lg:gap-[--rgrid-g]">
            <nav className="hidden lg:block lg:w-[--side-w] lg:flex-none">{nav}</nav>
            <main
              className={cn('lg:min-w-0 lg:flex-1 lg:pr-[--rgrid-m] xl:flex xl:gap-[--rgrid-g]')}
            >
              <article className="fooo lg:min-w-0 lg:flex-1">
                {children}
                {footer}
              </article>
              <aside className="hidden lg:flex-none xl:block xl:w-[--side-w]">{toc}</aside>
            </main>
          </div>
        </div>
        {/* </MenuContext> */}
      </DocsContext>
    </>
  )
}
