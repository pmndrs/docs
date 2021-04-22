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
          <input
            className="appearance-none w-full h-full p-4"
            type="search"
            onClick={() => setShowSearchModal(true)}
            placeholder='Quick search ("/" to focus)'
            onFocus={() => setShowSearchModal(true)}
          />
        </div>
      </div>
    </>
  )
}

export default Search
