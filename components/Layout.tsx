import clsx from 'clsx'
import { useSpring, animated as a } from 'react-spring'

import LibSwitcher from 'components/LibSwitcher'
import Nav from 'components/Nav'
import { MenuIcon } from 'components/Icons'
import Toc from 'components/Toc'
import Search from 'components/Search'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useSwitcher } from 'store/switcher'
import { useMenu } from 'store/menu'
import useLockBodyScroll from 'hooks/useLockBodyScroll'
import { useDocs } from 'store/docs'

export default function Layout({ nav, toc, children }) {
  const { isMenuOpen, toggleMenu, closeMenu } = useMenu()
  const { docs, currentDocs, getPrevAndNext } = useDocs()

  const {
    query: { slug },
    asPath,
  } = useRouter()
  const { isSwitcherOpen } = useSwitcher()

  const [lib] = slug as string[]
  const { nextPage, previousPage, currentPageIndex } = getPrevAndNext(asPath)
  const animationConfig = { mass: 1, tension: 180, friction: 20 }
  const navStyles = useSpring({ left: isMenuOpen ? 0 : -200, config: animationConfig })
  const overlayStyles = useSpring({ opacity: isMenuOpen ? 1 : 0.4, config: animationConfig })
  useLockBodyScroll(isMenuOpen)
  useEffect(() => closeMenu(), [asPath]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div id="modal" />
      <div
        className={clsx(
          'sticky top-0 flex flex-none w-full mx-auto border-b border-gray-200 bg-white max-w-8xl',
          isSwitcherOpen ? 'z-30 lg:z-30' : 'z-40 lg:z-50'
        )}
      >
        <Link href="/">
          <a aria-label="Poimandres Docs">
            <div className="h-full flex items-center flex-none p-2 pl-4 sm:pl-6 xl:pl-8 lg:w-60 xl:w-72">
              <span className="font-bold">Pmndrs</span>
              <span className="font-normal">.docs</span>
            </div>
          </a>
        </Link>
        <Search />
        <button className="block lg:hidden p-2 mr-2 ml-2" onClick={toggleMenu}>
          <MenuIcon />
        </button>
      </div>

      <div className="w-full mx-auto max-w-8xl">
        <div className="lg:flex">
          <div
            id="sidebar"
            className={`fixed inset-0 z-40 flex-none w-full h-full bg-black bg-opacity-25 lg:bg-white lg:static lg:h-auto lg:overflow-y-visible lg:pt-0 lg:w-60 xl:w-72 lg:block ${
              isMenuOpen ? '' : 'hidden'
            }`}
          >
            <a.div
              id="nav-wrapper"
              className={clsx(
                isSwitcherOpen ? '' : 'overflow-hidden overflow-y-auto',
                'h-full mr-24 scrolling-touch bg-white lg:h-auto lg:block lg:sticky lg:bg-transparent lg:top-16 lg:mr-0 z-10 relative'
              )}
              style={navStyles}
            >
              <nav
                id="nav"
                className={clsx(
                  isSwitcherOpen ? 'overflow-y-hidden' : 'overflow-y-auto',
                  'px-4 font-medium text-base lg:text-sm pb-10 lg:pb-14 sticky?lg:h-(screen-16) z-10 relative'
                )}
              >
                <div className="mt-8 md:mt-0 mb-4">
                  <LibSwitcher />
                </div>
                <Nav nav={nav[lib]} />
              </nav>
            </a.div>
            <a.button
              onClick={closeMenu}
              className={`w-screen h-screen z-0 fixed top-0 right-0 bg-gray-900 ${
                isMenuOpen ? '' : 'hidden'
              }`}
              style={overlayStyles}
            ></a.button>
          </div>
          <div id="content-wrapper" className={`flex-auto ${isMenuOpen ? 'overflow-hidden' : ''}`}>
            <div className="flex w-full">
              <div className="flex-auto min-w-0 px-4 pt-8 pb-24 sm:px-6 xl:px-8 lg:pb-16">
                <div className="">{children}</div>

                {docs[currentPageIndex] && (
                  <div className="flex justify-end w-full max-w-3xl pb-10 mx-auto mt-24">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-2 text-base text-gray-500 hover:text-gray-900 hover:underline"
                      href={currentDocs[currentPageIndex].editURL}
                    >
                      Edit this page on GitHub
                    </a>
                  </div>
                )}

                {(previousPage || nextPage) && (
                  <div className="flex justify-between w-full max-w-3xl mx-auto mt-12">
                    {previousPage && (
                      <div className="">
                        <h5 className="mb-2 text-xs font-bold leading-4 text-gray-500 uppercase">
                          Previous
                        </h5>
                        <div className="text-xl">
                          <Link href={previousPage.url}>
                            <a className="text-gray-900">{previousPage.title}</a>
                          </Link>
                        </div>
                      </div>
                    )}

                    {nextPage && (
                      <div className="ml-auto text-right">
                        <h5 className="mb-2 text-xs font-bold leading-4 text-gray-500 uppercase">
                          Next
                        </h5>
                        <div className="text-xl">
                          <Link href={nextPage.url}>
                            <a className="text-gray-900">{nextPage.title}</a>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-none hidden w-64 pl-8 mr-8 xl:text-sm xl:block">
                {toc.length ? <Toc toc={toc} /> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
