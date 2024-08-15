import * as React from 'react'

import { DocsContext } from './DocsContext'
import { getData } from '@/utils/docs'
import { MenuContext } from './MenuContext'
import { Menu } from './Menu'
import Nav from '@/components/Nav'
import Link from 'next/link'
import Search from '@/components/Search'
import ToggleTheme from '@/components/ToggleTheme'
import Toc from '@/components/Toc'

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

  return (
    <>
      <DocsContext value={{ docs, doc }}>
        <MenuContext>
          <Menu
            header={
              <>
                <div className="h-full flex items-center flex-none p-2 pl-4 sm:pl-6 xl:pl-4 lg:w-60 xl:w-72">
                  <Link href="/" aria-label="Poimandres Docs">
                    <span className="font-bold">{NEXT_PUBLIC_LIBNAME}</span>
                  </Link>
                  <span className="font-normal">
                    .<a href="https://docs.pmnd.rs">docs</a>
                  </span>
                </div>

                <Search />
                <ToggleTheme />
              </>
            }
            nav={
              <>
                {/* <div className="mt-8 md:mt-0 mb-4">
                  {NEXT_PUBLIC_LIBNAME?.length && (
                    <span className="mt-4 block w-full px-6 py-2 focus:outline-none bg-black rounded-md font-bold text-lg text-white dark:bg-white dark:text-gray-900 text-center">
                      {NEXT_PUBLIC_LIBNAME}
                    </span>
                  )}
                </div> */}
                <Nav docs={docs} asPath={asPath} />
              </>
            }
            aside={<Toc toc={doc.tableOfContents} />}
            footer={
              <>
                {!!currentPage && (
                  <div className="flex justify-end w-full max-w-3xl pb-10 mx-auto mt-24">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-2 text-base text-gray-500 hover:underline"
                      href={currentPage.editURL || '#no-edit-url'}
                    >
                      Edit this page
                    </a>
                  </div>
                )}

                {(!!previousPage || !!nextPage) && (
                  <nav className="flex justify-between w-full max-w-3xl mx-auto mt-12">
                    {!!previousPage && (
                      <div className="">
                        <label className="mb-2 text-xs font-bold leading-4 text-gray-500 uppercase">
                          Previous
                        </label>
                        <div className="text-xl">
                          <Link
                            href={previousPage.url}
                            className="text-gray-900 dark:text-gray-300"
                          >
                            {previousPage.title}
                          </Link>
                        </div>
                      </div>
                    )}
                    {!!nextPage && (
                      <div className="ml-auto text-right">
                        <label className="mb-2 text-xs font-bold leading-4 text-gray-500 uppercase">
                          Next
                        </label>
                        <div className="text-xl">
                          <Link href={nextPage.url} className="text-gray-900 dark:text-gray-300">
                            {nextPage.title}
                          </Link>
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
