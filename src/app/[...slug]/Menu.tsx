'use client'

import { Dialog, DialogPortal, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { useState } from 'react'

import { Burger } from './Burger'

/**
 * The mobile nav: a full-width panel under the header, which stays in view.
 *
 * Built from the dialog's parts rather than `DialogContent`, which centres a card over a
 * backdrop that would cover the header too. The popup is portalled to `<body>`, so it is
 * `fixed` against the viewport rather than `absolute` against the sticky header.
 */
export function Menu({ children, ...props }: DialogPrimitive.Popup.Props) {
  const [opened, setOpened] = useState(false)

  return (
    <Dialog open={opened} onOpenChange={setOpened}>
      <DialogTrigger aria-label="Menu">
        <Burger opened={opened} className="lg:hidden" />
      </DialogTrigger>
      <DialogPortal>
        <DialogPrimitive.Popup data-slot="dialog-content" {...props}>
          <DialogTitle className="sr-only">Menu</DialogTitle>
          {children}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  )
}
