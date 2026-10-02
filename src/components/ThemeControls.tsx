import { PrimaryColorPicker } from '@/components/PrimaryColorPicker'
import { ThemeToggle } from '@/components/ThemeToggle'
import cn from '@/lib/cn'
import { ComponentProps } from 'react'

/**
 * The reader's own theme: the color seeding the palette, and light, dark or the system's.
 *
 * Rendered more than once (the TOC column, the sidebar): each copy reads and writes the same
 * stored choices, and the pre-paint scripts only ever touch `<html>`, so they can run twice.
 */
export function ThemeControls({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex', className)} {...props}>
      <PrimaryColorPicker />
      <ThemeToggle />
    </div>
  )
}
