'use client'

import * as React from 'react'
import clsx from 'clsx'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { useDocs } from './DocsContext'
import { useMenu } from './MenuContext'
import Icon from '@/components/Icon'

export function Menu({
  header,
  nav,
  children,
  aside,
  footer,
}: {
  header: React.ReactNode
  nav: React.ReactNode
  children: React.ReactNode
  aside: React.ReactNode
  footer: React.ReactNode
}) {
  const { doc } = useDocs()

  const [menuOpen, setMenuOpen] = useMenu()
  useLockBodyScroll(menuOpen)

  React.useEffect(() => setMenuOpen(false), [setMenuOpen])

  const NEXT_PUBLIC_LIBNAME = process.env.NEXT_PUBLIC_LIBNAME

  return (
    <>
      <header className="max-w-8xl sticky top-0 z-40 mx-auto flex w-full flex-none border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 lg:z-50">
        <div className="flex w-full items-center justify-between pr-2">
          {header}
          <button
            className="flex size-9 items-center justify-center lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            type="button"
            aria-label="Menu"
          >
            <Icon icon="menu" />
          </button>
        </div>
      </header>

      <div className="max-w-8xl mx-auto w-full dark:bg-gray-900 dark:text-gray-100">
        <div className="lg:flex">
          <div
            id="sidebar"
            className={clsx(
              'fixed inset-0 z-40 h-full w-full flex-none bg-white bg-opacity-25 dark:!bg-gray-900 dark:text-gray-100 lg:static lg:block lg:h-auto lg:w-60 lg:overflow-y-visible lg:pt-0 xl:w-72',
              !menuOpen && 'hidden',
            )}
          >
            <div
              id="nav-wrapper"
              className="scrolling-touch relative z-10 mr-24 h-full overflow-hidden overflow-y-auto bg-white dark:bg-gray-900 lg:sticky lg:top-16 lg:mr-0 lg:block lg:h-auto lg:bg-transparent"
            >
              <nav
                id="nav"
                className="sticky?lg:h-(screen-16) relative z-10 overflow-y-auto px-4 pb-10 text-base font-medium lg:pb-14 lg:text-sm"
              >
                {nav}
              </nav>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className={clsx(
                'fixed right-0 top-0 z-0 h-screen w-screen bg-gray-900 opacity-0 dark:bg-gray-200',
                !menuOpen && 'hidden',
              )}
            />
          </div>
          <div id="content-wrapper" className={clsx('flex-auto', menuOpen && 'overflow-hidden')}>
            <div className="flex w-full">
              <main className="min-w-0 flex-auto px-4 pb-24 pt-8 sm:px-6 lg:pb-16 xl:px-8">
                <div>{children}</div>

                <footer>{footer}</footer>
              </main>

              <aside className="hidden w-64 flex-none pl-8 pr-8 xl:block xl:text-sm">{aside}</aside>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
