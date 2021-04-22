import React, { useEffect, useRef, useState } from 'react'
import { useSpring, animated as a } from 'react-spring'
import { useRouter } from 'next/router'
import useSearch, { Result } from 'hooks/useSearch'
import useKeyPress from 'hooks/useKeyPress'
import useLockBodyScroll from 'utils/useLockBodyScroll'
import Item from './item'

const Search = ({ allDocs }) => {
  const router = useRouter()
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [search, setSearch] = useState('')
  const input = useRef(null)
  const folder = router.query.slug[0]
  const [results, isThreeD]: [Result[], boolean] = useSearch({
    search,
    folder,
    allDocs,
    showSearchModal,
  })
  const renderList = results.length > 0
  const escPressed = useKeyPress('Escape')
  const slashPressed = useKeyPress('/')
  const { opacity } = useSpring({
    opacity: showSearchModal ? 1 : 0,
    config: {
      tension: 280,
      friction: 28,
    },
  })
  useLockBodyScroll(showSearchModal)

  useEffect(() => {
    setSearch('')
  }, [showSearchModal])

  useEffect(() => {
    if (escPressed && showSearchModal) {
      setShowSearchModal(false)
    }
  }, [escPressed])

  useEffect(() => {
    if (slashPressed && !showSearchModal) {
      setShowSearchModal(true)
    }
  }, [slashPressed])

  useEffect(() => setShowSearchModal(false), [router.asPath])

  return (
    <>
      {showSearchModal ? (
        <a.div
          className="absolute top-0 left-0 bottom-0 right-0 h-screen"
          style={{ zIndex: 99, opacity: opacity }}
        >
          <button
            className="opacity-50 bg-gray-900 w-screen h-screen"
            onClick={() => setShowSearchModal(false)}
          ></button>
          <div
            className="absolute top-20"
            style={{ width: 500, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}
          >
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-300"
                  aria-hidden
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="search"
                name="search"
                id="search"
                className={`outline-none focus:ring-gray-200 focus:border-gray-200 block w-full pl-10 sm:text-sm border-gray-300  bg-white px-4 py-6 text-gray-700 ${
                  renderList ? 'rounded-t-md' : 'rounded-md'
                }`}
                autoFocus
                placeholder="Search the docs"
                onChange={(e) => {
                  setSearch(e.target.value)
                }}
              />
              {renderList && (
                <ul className="list-none p-0 m-0 absolute left-0 bg-white pb-1 z-2 w-full rounded-b-md">
                  {results.map((res, i) => {
                    return (
                      <Item
                        key={`search-item-${i}`}
                        title={res.title}
                        href={res.url}
                        search={search}
                        multipleLibs={isThreeD}
                      />
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </a.div>
      ) : null}
      <div className="relative w-full">
        <div className="flex items-center justify-between flex-auto h-16 px-4 border-b border-gray-200">
          <input
            className="appearance-none w-full h-full p-4"
            type="search"
            onClick={() => setShowSearchModal(true)}
            placeholder='Quick search ("/" to focus)'
            onFocus={() => setShowSearchModal(true)}
            ref={input}
          />
        </div>
      </div>
    </>
  )
}

export default Search
