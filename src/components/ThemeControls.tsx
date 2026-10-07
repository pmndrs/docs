import { ColorMatchToggle } from '@/components/ColorMatchToggle'
import { ContrastToggle } from '@/components/ContrastToggle'
import { PrimaryColorPicker } from '@/components/PrimaryColorPicker'
import { SchemeToggle } from '@/components/SchemeToggle'
import { ThemeToggle } from '@/components/ThemeToggle'
import { TooltipProvider } from '@/components/ui/tooltip'
import cn from '@/lib/cn'
import { ComponentProps } from 'react'

/**
 * The reader's own theme: the color seeding the palette, its contrast, its scheme, whether it stays
 * true to the color, and light, dark or the system's.
 *
 * Rendered more than once (the TOC column, the sidebar): each copy reads and writes the same
 * stored choices, and the pre-paint scripts only ever touch `<html>`, so they can run twice.
 *
 * A control whose pick overrides the site's seed is outlined, and a double-click (or Delete) brings
 * the seed back; the light/dark toggle has neither, having no site seed (next-themes' own `system`
 * default).
 */
export function ThemeControls({ className, ...props }: ComponentProps<'div'>) {
  return (
    // The row's tooltips, shown at once on hover (shadcn's provider has no delay)
    <TooltipProvider>
      <div className={cn('flex', className)} {...props}>
        <PrimaryColorPicker />
        <ContrastToggle />
        <SchemeToggle />
        <ColorMatchToggle />
        <ThemeToggle />
      </div>
    </TooltipProvider>
  )
}
