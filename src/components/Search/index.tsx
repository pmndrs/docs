'use client'

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import cn from '@/lib/cn'
import { SearchIcon } from 'lucide-react'
import { ComponentProps, useEffect, useState } from 'react'

import { useKeyPress } from '@/hooks/useKeyPress'

import { SearchModalContainer } from './SearchModalContainer'

function Search({ className }: ComponentProps<typeof DialogTrigger>) {
  const [showSearchModal, setShowSearchModal] = useState(false)
  const slashPressed = useKeyPress('Slash')

  useEffect(() => {
    if (slashPressed && !showSearchModal) {
      setShowSearchModal(true)
    }
  }, [slashPressed, showSearchModal])

  return (
    <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
      <DialogTrigger className={className}>
        <SearchButton />
      </DialogTrigger>

      {/* A command palette, as shadcn's `CommandDialog` composes one, but opened by the trigger
       * above and hung from the top of the viewport rather than from its first third. */}
      <DialogContent
        showCloseButton={false}
        className="top-(--Search-Input-top) translate-y-0 overflow-hidden rounded-4xl! p-0 [--Search-Input-top:--spacing(8)] sm:max-w-3xl lg:[--Search-Input-top:--spacing(24)]"
      >
        <DialogTitle className="sr-only">Search anything</DialogTitle>
        <SearchModalContainer close={() => setShowSearchModal(false)} />
      </DialogContent>
    </Dialog>
  )
}

export function SearchButton({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        className,
        'group flex w-full items-center gap-2 rounded-l-full rounded-r-full p-2 px-4 text-sm',
        'bg-surface-container',
        'text-on-surface-variant/50 hover:text-inherit',
      )}
      {...props}
    >
      <SearchIcon className="size-5 flex-none" />
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
    </span>
  )
}

export default Search
