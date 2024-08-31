'use client'

import Icon from '@/components/Icon'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import cn from '@/lib/cn'
import * as React from 'react'
import { useDocs } from './DocsContext'
import { useMenu } from './MenuContext'

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
      <header className="max-w-8xl bg-surface sticky top-0 z-40 mx-auto flex w-full flex-none border-b border-outline-variant/50 lg:z-50">
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

      <div className="max-w-8xl mx-auto w-full">
        <div className="lg:flex">
          <div
            id="sidebar"
            className={cn(
              'fixed inset-0 z-40 h-full w-full flex-none lg:static lg:block lg:h-auto lg:w-60 lg:overflow-y-visible lg:pt-0 xl:w-72',
              !menuOpen && 'hidden',
            )}
          >
            <div
              id="nav-wrapper"
              className="scrolling-touch bg-surface relative z-10 mr-24 h-full overflow-hidden overflow-y-auto lg:sticky lg:top-16 lg:mr-0 lg:block lg:h-auto lg:bg-transparent"
            >
              <nav
                id="nav"
                className="sticky?lg:h-(screen-16) relative z-10 overflow-y-auto px-4 pb-10 pl-0 lg:pb-14 lg:text-sm"
              >
                {nav}
              </nav>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className={cn(
                'bg-surface/70',
                'fixed right-0 top-0 z-0 h-screen w-screen',
                !menuOpen && 'hidden',
              )}
            />
          </div>
          <div id="content-wrapper" className={cn('flex-auto', menuOpen && 'overflow-hidden')}>
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
