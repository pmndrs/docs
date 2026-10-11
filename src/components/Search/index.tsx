'use client'

import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
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
      <DialogTrigger className={className} render={<SearchButton />} />

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

/**
 * Search trigger presentation, composed as the dialog's single native button.
 */
export function SearchButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="secondary"
      aria-label="Search for anything"
      className={cn('min-w-0 flex-1 justify-start', className)}
      {...props}
    >
      <SearchIcon data-icon="inline-start" />
      <span>
        Search
        <span className="hidden sm:inline"> for anything</span>
      </span>
      <Kbd title="Forward slash" className="ml-auto hidden sm:inline-flex">
        /
      </Kbd>
    </Button>
  )
}

export default Search
