'use client'

import * as React from 'react'
// import { useRouter } from 'next/navigation'

import { useKeyPress } from '@/hooks/useKeyPress'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

import Icon from '@/components/Icon'
import cn from '@/lib/cn'
import { SearchModalContainer } from './SearchModalContainer'

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
        <div className="flex flex-auto items-center justify-between">
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className={cn(
              'group flex w-full items-center gap-2 rounded-l-full rounded-r-full p-2 px-4 text-sm',
              'interactive-bg-surface-container',
              'text-on-surface-variant/50 hover:text-[inherit]',
            )}
            onFocus={() => setShowSearchModal(true)}
          >
            <Icon icon="search" className={cn('size-6')} />
            <span>
              Search
              <span className="hidden sm:inline"> for anything</span>
            </span>
            <span className="ml-auto hidden rounded-md border px-1.5 py-0.5 text-sm leading-5 sm:block">
              <span className="sr-only">Press </span>
              <kbd>
                <kbd title="Forward slash" className="no-underline">
                  /
                </kbd>
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
