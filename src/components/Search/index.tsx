import * as React from 'react'
import { useRouter } from 'next/router'

import { useKeyPress } from 'hooks/useKeyPress'
import { useLockBodyScroll } from 'hooks/useLockBodyScroll'

import Icon from 'components/Icon'
import { SearchModalContainer } from './SearchModalContainer'

function Search() {
  const router = useRouter()
  const [showSearchModal, setShowSearchModal] = React.useState(false)
  const escPressed = useKeyPress('Escape')
  const slashPressed = useKeyPress('Slash')
  useLockBodyScroll(showSearchModal)

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
        <SearchModalContainer
          key={showSearchModal ? 'show' : 'hide'}
          onClose={() => setShowSearchModal(false)}
        />
      )}
      <div className="relative grow">
        <div className="flex items-center justify-between flex-auto h-16 px-4">
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="group leading-6 font-medium flex items-center space-x-3 sm:space-x-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 w-full py-2 dark:text-gray-500 dark:hover:text-gray-400"
            onFocus={() => setShowSearchModal(true)}
          >
            <Icon
              icon="search"
              className="h-6 w-6 text-gray-400 group-hover:text-gray-500 transition-colors duration-200 dark:group-hover:text-gray-400 dark:text-gray-500"
            />
            <span>
              Quick search
              <span className="hidden sm:inline"> for anything</span>
            </span>
            <span
              style={{ opacity: 1 }}
              className="hidden sm:block text-gray-400 text-sm leading-5 py-0.5 px-1.5 border border-gray-300 rounded-md dark:border-gray-700"
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
