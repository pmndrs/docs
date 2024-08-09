import clsx from 'clsx'
import * as React from 'react'
import LibSwitcher from '@/components/LibSwitcher'
import Nav from '@/components/Nav'
import Icon from '@/components/Icon'
import Toc from '@/components/Toc'
import Search from '@/components/Search'
import Link from 'next/link'
// import { useRouter } from 'next/router'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

import ToggleTheme from '@/components/ToggleTheme'

import { Doc, DocsContext } from './DocsContext'
import libraries from '@/data/libraries'
import { notFound } from 'next/navigation'
import { getData, getDocs } from '@/utils/docs'

export type Props = {
  params: { slug: string[] }
  children: React.ReactNode
}

export default async function Layout({ params, children }: Props) {
  const slug = params.slug

  // 404
  if (!(slug[0] in libraries)) {
    return notFound()
  }

  const asPath = `/${slug.join('/')}`

  const lib = slug[0]

  const { docs, doc } = await getData(...slug)
  // console.log('docs', docs)

  // const [menuOpen, setMenuOpen] = React.useState(false)
  // useLockBodyScroll(menuOpen)

  // const { asPath } = useRouter()
  const currentPageIndex = docs.findIndex((item) => item.url === asPath)
  const currentPage = docs[currentPageIndex]
  const previousPage = currentPageIndex > 0 && docs[currentPageIndex - 1]
  const nextPage = currentPageIndex < docs.length - 1 && docs[currentPageIndex + 1]

  // React.useEffect(() => setMenuOpen(false), [asPath])

  return (
    <>
      <DocsContext value={docs}>
        <header className="sticky top-0 flex flex-none w-full mx-auto border-b border-gray-200 bg-white max-w-8xl z-40 lg:z-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
          <div className="flex justify-between items-center w-full pr-2">
            <Link href="/" aria-label="Poimandres Docs">
              <div className="h-full flex items-center flex-none p-2 pl-4 sm:pl-6 xl:pl-4 lg:w-60 xl:w-72">
                <span className="font-bold">Pmndrs</span>
                <span className="font-normal">.docs</span>
              </div>
            </Link>
            <Search />
            <button
              className="block lg:hidden p-2 mr-2 ml-2"
              // onClick={() => setMenuOpen((v) => !v)}
              type="button"
              aria-label="Menu"
            >
              <Icon icon="menu" />
            </button>
            <ToggleTheme />
          </div>
        </header>

        <div className="w-full mx-auto max-w-8xl dark:bg-gray-900 dark:text-gray-100">
          <div className="lg:flex">
            <div
              id="sidebar"
              className={clsx(
                'fixed inset-0 z-40 flex-none w-full h-full bg-opacity-25  lg:static lg:h-auto lg:overflow-y-visible lg:pt-0 lg:w-60 xl:w-72 lg:block bg-white dark:!bg-gray-900 dark:text-gray-100'
                // !menuOpen && 'hidden'
              )}
            >
              <div
                id="nav-wrapper"
                className="overflow-hidden overflow-y-auto h-full mr-24 scrolling-touch lg:h-auto lg:block lg:sticky lg:bg-transparent lg:top-16 lg:mr-0 z-10 relative bg-white dark:bg-gray-900"
              >
                <nav
                  id="nav"
                  className="overflow-y-auto px-4 font-medium text-base lg:text-sm pb-10 lg:pb-14 sticky?lg:h-(screen-16) z-10 relative"
                >
                  <div className="mt-8 md:mt-0 mb-4">
                    <LibSwitcher currentPage={libraries[lib].title} lib={lib} />
                  </div>
                  <Nav docs={docs} asPath={asPath} />
                </nav>
              </div>
              {/* <button
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  'w-screen h-screen z-0 fixed top-0 right-0 bg-gray-900 opacity-0 dark:bg-gray-200',
                  !menuOpen && 'hidden'
                )}
              /> */}
            </div>
            <div
              id="content-wrapper"
              className={clsx(
                'flex-auto'
                // menuOpen && 'overflow-hidden'
              )}
            >
              <div className="flex w-full">
                <main className="flex-auto min-w-0 px-4 pt-8 pb-24 sm:px-6 xl:px-8 lg:pb-16">
                  <div>{children}</div>

                  <footer>
                    {!!currentPage && (
                      <div className="flex justify-end w-full max-w-3xl pb-10 mx-auto mt-24">
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mb-2 text-base text-gray-500 hover:underline"
                          href={currentPage.editURL}
                        >
                          Edit this page on GitHub
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
                              <Link
                                href={nextPage.url}
                                className="text-gray-900 dark:text-gray-300"
                              >
                                {nextPage.title}
                              </Link>
                            </div>
                          </div>
                        )}
                      </nav>
                    )}
                  </footer>
                </main>

                <aside className="flex-none hidden w-64 pl-8 pr-8 xl:text-sm xl:block">
                  {doc?.tableOfContents?.length ? <Toc toc={doc.tableOfContents} /> : null}
                </aside>
              </div>
            </div>
          </div>
        </div>
      </DocsContext>
    </>
  )
}
