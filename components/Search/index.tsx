import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import useSearch, { Result } from 'hooks/useSearch'
import useKeyPress from 'hooks/useKeyPress'
import useLockBodyScroll from 'utils/useLockBodyScroll'
import SearchModal from './SearchModal'
import { useDocs } from 'store/docs'

const Search = () => {
  const { query, asPath } = useRouter()
  const { docs } = useDocs()
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [search, setSearch] = useState('')
  // @ts-ignore
  const [folder] = query.slug
  const [results, isThreeD]: [Result[], boolean] = useSearch({
    search,
    folder,
    docs,
  })
  const escPressed = useKeyPress('Escape')
  const slashPressed = useKeyPress('/')
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

  useEffect(() => setShowSearchModal(false), [asPath])

  return (
    <>
      {showSearchModal ? (
        <SearchModal
          isThreeD={isThreeD}
          onChange={(e) => {
            setSearch(e.target.value)
          }}
          search={search}
          results={results}
          close={() => setShowSearchModal(false)}
        />
      ) : null}
      <div className="relative w-full">
        <div className="flex items-center justify-between flex-auto h-16 px-4 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="group leading-6 font-medium flex items-center space-x-3 sm:space-x-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 w-full py-2"
            onFocus={() => setShowSearchModal(true)}
          >
            <svg
              width="24"
              height="24"
              fill="none"
              className="text-gray-400 group-hover:text-gray-500 transition-colors duration-200"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
            <span>
              Quick search
              <span className="hidden sm:inline"> for anything</span>
            </span>
            <span
              style={{ opacity: 1 }}
              className="hidden sm:block text-gray-400 text-sm leading-5 py-0.5 px-1.5 border border-gray-300 rounded-md"
            >
              <span className="sr-only">Press </span>
              <kbd className="font-sans">
                <abbr title="Forward slash" className="no-underline">
                  /
                </abbr>
              </kbd>
              <span className="sr-only"> to search</span>
            </span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Search
