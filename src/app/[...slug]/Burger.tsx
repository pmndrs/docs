'use client'

import Icon from '@/components/Icon'
import cn from '@/lib/cn'
import { ComponentProps } from 'react'

export function Burger({ opened, className }: { opened: boolean } & ComponentProps<'span'>) {
  return (
    <span className={cn(className, 'flex size-9 items-center justify-center')} aria-label="Menu">
      {opened ? <Icon icon="close" /> : <Icon icon="menu" />}
    </span>
  )
}
