import clsx from 'clsx'
import { useSpring, animated as a } from 'react-spring'

import LibSwitcher from 'components/LibSwitcher'
import Nav from 'components/Nav'
import Toc from 'components/Toc'

import Link from 'next/link'

import { useRouter } from 'next/router'
import { useSwitcher } from 'store/switcher'

function Layout(props) {
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

  const currentPageIndex = allDocs.findIndex((item) => item.url === asPath)

  const previousPage = currentPageIndex > 0 && allDocs[currentPageIndex - 1]
  const nextPage = currentPageIndex < allDocs.length - 1 && allDocs[currentPageIndex + 1]

  return (
    <>
      <div id="modal" />
      <div
        className={clsx(
          'sticky top-0 flex flex-none w-full mx-auto bg-white max-w-8xl',
          isSwitcherOpen ? 'z-30 lg:z-30' : 'z-40 lg:z-50'
        )}
      >
        <a.div
          style={{ opacity }}
          className="flex items-center flex-none pl-4 border-b border-gray-200 sm:pl-6 xl:pl-8 lg:border-b-0 lg:w-60 xl:w-72"
        >
          <span className="font-bold">Pmdnrs</span>
          <span className="font-normal">.docs</span>
        </a.div>
        <div className="flex items-center justify-between flex-auto h-16 px-4 border-b border-gray-200 sm:px-6 lg:mx-6 lg:px-0 xl:mx-8">
          Quick search [⌘ + K]
        </div>
      </div>

      <div className="w-full mx-auto max-w-8xl">
        <div className="lg:flex">
          <div
            id="sidebar"
            className="fixed inset-0 z-40 flex-none hidden w-full h-full bg-black bg-opacity-25 lg:bg-white lg:static lg:h-auto lg:overflow-y-visible lg:pt-0 lg:w-60 xl:w-72 lg:block"
          >
            <div
              id="nav-wrapper"
              className="h-full mr-24 overflow-hidden overflow-y-auto scrolling-touch bg-white lg:h-auto lg:block lg:relative lg:sticky lg:bg-transparent lg:top-16 lg:mr-0"
            >
              <div
                id="nav"
                className="
              pt-6 
              overflow-y-auto 
              font-medium 
              text-base 
              lg:text-sm 
              pb-10 
              lg:pt-10 
              lg:pb-14 
              sticky?lg:h-(screen-16)
            "
              >
                <div className="mb-4">
                  <LibSwitcher />
                </div>

                <Nav nav={nav[lib]} />
              </div>
            </div>
          </div>
          <div id="content-wrapper" className="flex-auto">
            <div className="flex w-full">
              <div className="flex-auto min-w-0 px-4 pt-10 pb-24 sm:px-6 xl:px-8 lg:pb-16">
                <div className="">{props.children}</div>

                {(previousPage || nextPage) && (
                  <div className="flex justify-between w-full max-w-3xl pb-24 mx-auto mt-24">
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
                <Toc toc={toc} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Layout
