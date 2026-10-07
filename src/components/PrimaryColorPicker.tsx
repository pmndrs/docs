'use client'

import { PRIMARY_COLOR_PREPAINT_VAR } from '@/components/PrimaryColorPrepaint'
import { Color } from '@/registry/color/color'
import { Button } from '@/components/ui/button'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import { isHexColor, usePrimaryColor } from '@/hooks/usePrimaryColor'
import { cn } from '@/lib/utils'
import { useRef } from 'react'

/**
 * A swatch of the color seeding the site's palette, opening the browser's color picker to pick
 * another one: remembered across pages, reloads and tabs (see `usePrimaryColor`). Picking the
 * site's default again forgets the choice.
 */
export function PrimaryColorPicker({ className }: { className?: string }) {
  const [primaryColor, setPrimaryColor] = usePrimaryColor()
  const inputRef = useRef<HTMLInputElement>(null)
  const isHydrated = useIsHydrated()
  // Until hydrated, `primaryColor` is the default, as on the server: the stored pick is the one the
  // pre-paint script put on `<html>`
  const swatchColor = isHydrated
    ? primaryColor
    : `var(${PRIMARY_COLOR_PREPAINT_VAR}, ${primaryColor})`

  return (
    // The native picker opens where its input is: under the swatch, out of sight
    <div className={cn('relative', className)}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Theme color"
        onClick={() => inputRef.current?.click()}
      >
        <Color color={swatchColor} size="sm" />
      </Button>
      <input
        ref={inputRef}
        type="color"
        tabIndex={-1}
        aria-hidden
        // Only a `#rrggbb` is one it can show: black for any other default
        value={isHexColor(primaryColor) ? primaryColor.toLowerCase() : '#000000'}
        onChange={(event) => setPrimaryColor(event.target.value)}
        className="pointer-events-none absolute inset-0 size-full opacity-0"
      />
    </div>
  )
}
