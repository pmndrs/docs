'use client'

import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { ComponentProps, useState } from 'react'

import { Burger } from './Burger'

export function Menu({ children, ...props }: ComponentProps<typeof Dialog.Content>) {
  const [opened, setOpened] = useState(false)

  return (
    <Dialog.Root open={opened} onOpenChange={setOpened}>
      <Dialog.Trigger aria-label="Menu">
        <Burger opened={opened} className="lg:hidden" />
      </Dialog.Trigger>
      <Dialog.Content {...props}>
        <VisuallyHidden.Root>
          <Dialog.Title>Menu</Dialog.Title>
        </VisuallyHidden.Root>
        {children}
      </Dialog.Content>
    </Dialog.Root>
  )
}
