'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { ComponentProps } from 'react'

import { Burger } from './Burger'
import { useMenu } from './MenuContext'

export function Menu({ ...props }: ComponentProps<typeof Dialog.Content>) {
  const [opened, setOpened] = useMenu()

  return (
    <Dialog.Root open={opened} onOpenChange={setOpened}>
      <Dialog.Trigger>
        <Burger className="lg:hidden" />
      </Dialog.Trigger>
      <Dialog.Content {...props} />
    </Dialog.Root>
  )
}
