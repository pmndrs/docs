'use client'

import { PRIMARY_COLOR_PREPAINT_VAR } from '@/components/PrimaryColorPrepaint'
import { Color } from '@/registry/color/color'
import { ThemeControlButton } from '@/components/ThemeControlButton'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import { isHexColor, usePrimaryColor } from '@/hooks/usePrimaryColor'
import { cn } from '@/lib/utils'
import { useRef } from 'react'

/**
 * A swatch of the color seeding the site's palette, opening the browser's color picker to pick
 * another one: remembered across pages, reloads and tabs (see `usePrimaryColor`). Picking the
 * site's default again, or double-clicking (or Delete on the focused swatch), forgets the choice.
 */
export function PrimaryColorPicker({ className }: { className?: string }) {
  const [primaryColor, setPrimaryColor, isDefault, reset] = usePrimaryColor()
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
      <ThemeControlButton
        seed="primaryColor"
        overridden={!isDefault}
        onReset={reset}
        aria-label="Theme color"
        onClick={() => inputRef.current?.click()}
      >
        <Color color={swatchColor} size="sm" />
      </ThemeControlButton>
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
