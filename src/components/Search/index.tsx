'use client'

import Icon from '@/components/Icon'
import cn from '@/lib/cn'
import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { ComponentProps, useEffect, useState } from 'react'

import { useKeyPress } from '@/hooks/useKeyPress'

import { SearchModalContainer } from './SearchModalContainer'

function Search({ className }: ComponentProps<typeof Dialog.Trigger>) {
  const [showSearchModal, setShowSearchModal] = useState(false)
  const slashPressed = useKeyPress('Slash')

  useEffect(() => {
    if (slashPressed && !showSearchModal) {
      setShowSearchModal(true)
    }
  }, [slashPressed, showSearchModal])

  return (
    <Dialog.Root open={showSearchModal} onOpenChange={setShowSearchModal}>
      <Dialog.Trigger className={className}>
        <SearchButton />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Content className="fixed inset-0 z-50">
          <VisuallyHidden.Root>
            <Dialog.Title>Search anything</Dialog.Title>
          </VisuallyHidden.Root>

          <Dialog.Overlay className="absolute inset-0 bg-surface-dim/95">
            <Dialog.Close className="size-full" />
          </Dialog.Overlay>

          <SearchModalContainer className="relative mx-auto max-w-3xl rounded-md px-4 shadow-sm [--Search-Input-top:theme(spacing.8)] lg:[--Search-Input-top:theme(spacing.24)]" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function SearchButton({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        className,
        'group flex w-full items-center gap-2 rounded-l-full rounded-r-full p-2 px-4 text-sm',
        'interactive-bg-surface-container',
        'text-on-surface-variant/50 hover:text-[inherit]',
      )}
      {...props}
    >
      <Icon icon="search" className="size-6" />
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
