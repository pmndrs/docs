'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { ComponentProps, useState } from 'react'

import { Burger } from './Burger'

export function Menu({ ...props }: ComponentProps<typeof Dialog.Content>) {
  const [opened, setOpened] = useState(false)

  return (
    <Dialog.Root open={opened} onOpenChange={setOpened}>
      <Dialog.Trigger>
        <Burger opened={opened} className="lg:hidden" />
      </Dialog.Trigger>
      <Dialog.Content {...props} />
    </Dialog.Root>
  )
}
