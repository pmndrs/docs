'use client'

import clsx from 'clsx'
import * as React from 'react'
import Toc from '@/components/Toc'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { useDocs } from './DocsContext'
import { useMenu } from './MenuContext'
import Icon from '@/components/Icon'

export function Menu({
  header,
  nav,
  children,
  footer,
}: {
  header: React.ReactNode
  nav: React.ReactNode
  children: React.ReactNode
  footer: React.ReactNode
}) {
  const { doc } = useDocs()

  const [menuOpen, setMenuOpen] = useMenu()
  useLockBodyScroll(menuOpen)

  React.useEffect(() => setMenuOpen(false), [])

  const NEXT_PUBLIC_LIBNAME = process.env.NEXT_PUBLIC_LIBNAME

  return (
    <>
      <header className="sticky top-0 flex flex-none w-full mx-auto border-b border-gray-200 bg-white max-w-8xl z-40 lg:z-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
        <div className="flex justify-between items-center w-full pr-2">
          {header}
          <button
            className="block lg:hidden p-2 mr-2 ml-2"
            onClick={() => setMenuOpen((v) => !v)}
            type="button"
            aria-label="Menu"
          >
            <Icon icon="menu" />
          </button>
        </div>
      </header>

      <div className="w-full mx-auto max-w-8xl dark:bg-gray-900 dark:text-gray-100">
        <div className="lg:flex">
          <div
            id="sidebar"
            className={clsx(
              'fixed inset-0 z-40 flex-none w-full h-full bg-opacity-25  lg:static lg:h-auto lg:overflow-y-visible lg:pt-0 lg:w-60 xl:w-72 lg:block bg-white dark:!bg-gray-900 dark:text-gray-100',
              !menuOpen && 'hidden'
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
                {nav}
              </nav>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className={clsx(
                'w-screen h-screen z-0 fixed top-0 right-0 bg-gray-900 opacity-0 dark:bg-gray-200',
                !menuOpen && 'hidden'
              )}
            />
          </div>
          <div id="content-wrapper" className={clsx('flex-auto', menuOpen && 'overflow-hidden')}>
            <div className="flex w-full">
              <main className="flex-auto min-w-0 px-4 pt-8 pb-24 sm:px-6 xl:px-8 lg:pb-16">
                <div>{children}</div>

                <footer>{footer}</footer>
              </main>

              <aside className="flex-none hidden w-64 pl-8 pr-8 xl:text-sm xl:block">
                {doc?.tableOfContents?.length ? <Toc toc={doc.tableOfContents} /> : null}
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
