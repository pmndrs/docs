import * as React from 'react'

import Nav from '@/components/Nav'
import Search from '@/components/Search'
import { Toc } from '@/components/mdx/Toc'
import cn from '@/lib/cn'
import { getData } from '@/utils/docs'
import Link from 'next/link'
import { PiDiscordLogoLight } from 'react-icons/pi'
import { VscGithubAlt } from 'react-icons/vsc'
import { DocsContext } from './DocsContext'
import { Menu } from './Menu'
import { MenuContext } from './MenuContext'

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

  return (
    <>
      <DocsContext value={{ docs, doc }}>
        <MenuContext>
          <Menu
            header={
              <>
                <div className="flex h-full flex-none items-center p-2 pl-4 sm:pl-6 lg:w-60 xl:w-72 xl:pl-4">
                  <Link href="/" aria-label="Poimandres Docs">
                    <span className="font-bold">
                      {NEXT_PUBLIC_LIBNAME_SHORT && (
                        <span className="inline lg:hidden">{NEXT_PUBLIC_LIBNAME_SHORT}</span>
                      )}
                      <span
                        className={cn(
                          NEXT_PUBLIC_LIBNAME_SHORT ? 'hidden' : undefined,
                          'lg:inline',
                        )}
                      >
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
                      className="hidden size-9 items-center justify-center sm:flex"
                      target="_blank"
                    >
                      <VscGithubAlt />
                    </Link>
                  )}
                  {process.env.DISCORD && (
                    <Link
                      href={process.env.DISCORD}
                      className="hidden size-9 items-center justify-center sm:flex"
                      target="_blank"
                    >
                      <PiDiscordLogoLight />
                    </Link>
                  )}
                  {/* <ToggleTheme className="hidden size-9 items-center justify-center sm:flex" /> */}
                </div>
              </>
            }
            nav={<Nav docs={docs} asPath={asPath} />}
            aside={<Toc toc={doc.tableOfContents} />}
            footer={
              <>
                {!!currentPage && (
                  <div className="mx-auto mt-24 flex w-full max-w-3xl justify-end pb-10">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn('mb-2 text-base hover:underline', 'text-on-surface-variant/50')}
                      href={currentPage.editURL || '#no-edit-url'}
                    >
                      Edit this page
                    </a>
                  </div>
                )}

                {(!!previousPage || !!nextPage) && (
                  <nav className="mx-auto mt-12 flex w-full max-w-3xl justify-between">
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
                          <Link href={nextPage.url}>{nextPage.title}</Link>
                        </div>
                      </div>
                    )}
                  </nav>
                )}
              </>
            }
          >
            {children}
          </Menu>
        </MenuContext>
      </DocsContext>
    </>
  )
}
