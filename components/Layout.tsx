import clsx from 'clsx'
import { useSpring, animated as a, config } from 'react-spring'

import LibSwitcher from 'components/LibSwitcher'
import Nav from 'components/Nav'
import Toc from 'components/Toc'
import Search from 'components/Search'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useSwitcher } from 'store/switcher'
import { useMenu } from 'store/menu'

export default function Layout(props) {
  const { isMenuOpen, toggleMenu, closeMenu } = useMenu()
  const { nav, toc, allDocs } = props
  const {
    query: { slug },
    asPath,
  } = useRouter()
  const { isSwitcherOpen } = useSwitcher()
  const { opacity } = useSpring({
    opacity: isSwitcherOpen ? 0 : 1,
    config: {
      tension: 280,
      friction: 28,
    },
  })

  const [lib] = slug as string[]
  const folder = slug[0]
  const currentDocs = allDocs.filter((doc) => doc.url.includes(`/${folder}/`))
  const currentPageIndex = currentDocs.findIndex((item) => item.url === asPath)
  const previousPage = currentPageIndex > 0 && currentDocs[currentPageIndex - 1]
  const nextPage = currentPageIndex < currentDocs.length - 1 && currentDocs[currentPageIndex + 1]
  const animationConfig = { mass: 1, tension: 180, friction: 20 }
  const navStyles = useSpring({ left: isMenuOpen ? 0 : -200, config: animationConfig })
  const overlayStyles = useSpring({ opacity: isMenuOpen ? 1 : 0.4, config: animationConfig })

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
  }, [isMenuOpen])

  useEffect(() => closeMenu(), [asPath])

  return (
    <>
      <div id="modal" />
      <div
        className={clsx(
          'sticky top-0 flex flex-none w-full mx-auto bg-white max-w-8xl',
          isSwitcherOpen ? 'z-30 lg:z-30' : 'z-40 lg:z-50'
        )}
      >
        <Link href="/">
          <a.div
            style={{ opacity }}
            className="flex items-center flex-none pl-4 border-b border-gray-200 sm:pl-6 xl:pl-8 lg:border-b-0 lg:w-60 xl:w-72"
          >
            <span className="font-bold">Pmdnrs</span>
            <span className="font-normal">.docs</span>
          </a.div>
        </Link>
        <Search allDocs={props.allDocs} />
        <button className="block md:hidden p-2 mr-2 ml-2" onClick={toggleMenu}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
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
              className="h-full mr-24 overflow-hidden overflow-y-auto scrolling-touch bg-white lg:h-auto lg:block lg:relative lg:sticky lg:bg-transparent lg:top-16 lg:mr-0 z-10
              relative"
              style={navStyles}
            >
              <nav
                id="nav"
                className=" px-4 overflow-y-auto  font-medium  text-base  lg:text-sm  pb-10  lg:pb-14  sticky?lg:h-(screen-16) z-10 relative"
              >
                <div className="mb-4">
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
                <div className="">{props.children}</div>

                {allDocs[currentPageIndex] ? (
                  <div className="flex justify-end w-full max-w-3xl pb-10 mx-auto mt-24">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-2 text-base text-gray-500 hover:text-gray-900 hover:underline"
                      href={`https://github.com/pmndrs/website/tree/docs/docs${allDocs[currentPageIndex].url}.mdx`}
                    >
                      Edit this page on GitHub
                    </a>
                  </div>
                ) : null}

                {(previousPage || nextPage) && (
                  <div className="flex justify-between w-full max-w-3xl  mx-auto mt-12">
                    {previousPage && (
                      <div className="">
                        <h5 className="mb-2 text-xs font-bold leading-4 text-gray-500 uppercase">
                          Previous
                        </h5>
                        <div className="text-xl capitalize">
                          <Link href={previousPage.url}>
                            <a>{previousPage.title}</a>
                          </Link>
                        </div>
                      </div>
                    )}

                    {nextPage && (
                      <div className="ml-auto text-right">
                        <h5 className="mb-2 text-xs font-bold leading-4 text-gray-500 uppercase">
                          Next
                        </h5>
                        <div className="text-xl capitalize">
                          <Link href={nextPage.url}>
                            <a>{nextPage.title}</a>
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
