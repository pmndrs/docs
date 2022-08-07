import * as React from 'react'
import { useRouter } from 'next/router'
import { useKeyPress } from 'hooks/useKeyPress'
import { useLockBodyScroll } from 'hooks/useLockBodyScroll'
import SearchModal from './SearchModal'

function Search() {
  const router = useRouter()
  const [showSearchModal, setShowSearchModal] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [lib] = router.query.slug as string[]
  const [results, setResults] = React.useState([])
  const escPressed = useKeyPress('Escape')
  const slashPressed = useKeyPress('Slash')
  useLockBodyScroll(showSearchModal)

  React.useEffect(() => {
    if (!query) return void setResults([])

    const controller = new AbortController()

    fetch('/api/search', {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ lib, query }),
    })
      .then(async (res) => {
        const results = await res.json()
        setResults(results)
      })
      .catch((e) => {
        if (e.name !== 'AbortError') console.error(e)
      })

    return () => controller.abort()
  }, [lib, query])

  React.useEffect(() => void setQuery(''), [showSearchModal])

  React.useEffect(() => {
    if (escPressed && showSearchModal) {
      setShowSearchModal(false)
    }
  }, [escPressed, slashPressed, showSearchModal])

  React.useEffect(() => {
    if (slashPressed && !showSearchModal) {
      setShowSearchModal(true)
    }
  }, [slashPressed, showSearchModal])

  React.useEffect(() => setShowSearchModal(false), [router.asPath])

  return (
    <>
      {showSearchModal && (
        <SearchModal
          search={query}
          results={results}
          onClose={() => setShowSearchModal(false)}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}
      <div className="relative w-full">
        <div className="flex items-center justify-between flex-auto h-16 px-4">
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
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
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
