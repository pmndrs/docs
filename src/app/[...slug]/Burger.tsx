'use client'

import cn from '@/lib/cn'
import { MenuIcon, XIcon } from 'lucide-react'
import { ComponentProps } from 'react'

export function Burger({ opened, className }: { opened: boolean } & ComponentProps<'span'>) {
  return (
    <span className={cn(className, 'flex size-9 items-center justify-center')}>
      {opened ? <XIcon className="size-5 flex-none" /> : <MenuIcon className="size-5 flex-none" />}
    </span>
  )
}
