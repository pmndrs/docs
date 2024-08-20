'use client'

import * as React from 'react'
// import { useRouter } from 'next/navigation'

import { useKeyPress } from '@/hooks/useKeyPress'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

import Icon from '@/components/Icon'
import { SearchModalContainer } from './SearchModalContainer'
import cn from '@/lib/cn'

function Search() {
  // const router = useRouter()
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

  React.useEffect(() => setShowSearchModal(false), [])

  return (
    <>
      {showSearchModal && (
        <SearchModalContainer
          key={showSearchModal ? 'show' : 'hide'}
          onClose={() => setShowSearchModal(false)}
        />
      )}
      <div className="relative grow">
        <div className="flex h-16 flex-auto items-center justify-between px-4 text-on-surface-variant/50 transition-colors duration-200 hover:text-[inherit]">
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className={cn(
              'group flex w-full items-center space-x-3 py-2 font-medium leading-6 sm:space-x-4',

              'interative-bg-surface-container',
            )}
            onFocus={() => setShowSearchModal(true)}
          >
            <Icon icon="search" className={cn('h-6 w-6')} />
            <span>
              Quick search
              <span className="hidden sm:inline"> for anything</span>
            </span>
            <span
              style={{ opacity: 1 }}
              className={cn('hidden rounded-md border px-1.5 py-0.5 text-sm leading-5 sm:block')}
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
