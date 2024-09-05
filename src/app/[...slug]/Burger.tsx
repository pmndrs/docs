'use client'

import Icon from '@/components/Icon'
import cn from '@/lib/cn'
import { ComponentProps } from 'react'
import { useMenu } from './MenuContext'

export function Burger({ className }: ComponentProps<'button'>) {
  const [menuOpen, setMenuOpen] = useMenu()

  return (
    <button
      className={cn(className, 'flex size-9 items-center justify-center')}
      type="button"
      aria-label="Menu"
      onClick={() => setMenuOpen(!menuOpen)}
    >
      {menuOpen ? <Icon icon="close" /> : <Icon icon="menu" />}
    </button>
  )
}
