'use client'

import { Button } from '@/components/ui/button'
import { isHexColor, usePrimaryColor } from '@/hooks/usePrimaryColor'
import cn from '@/lib/cn'
import { RotateCcwIcon } from 'lucide-react'
import { useRef } from 'react'

/**
 * A swatch of the color seeding the site's palette, opening the browser's color picker to pick
 * another one: remembered across pages, reloads and tabs (see `usePrimaryColor`). Once picked, a
 * reset button brings back the site's default.
 */
export function PrimaryColorPicker({ className }: { className?: string }) {
  const [primaryColor, setPrimaryColor, isDefault] = usePrimaryColor()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className={cn('flex', className)}>
      {!isDefault && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Reset the theme color"
          onClick={() => setPrimaryColor(null)}
        >
          <RotateCcwIcon />
        </Button>
      )}

      {/* The native picker opens where its input is: under the swatch, out of sight */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Theme color"
          onClick={() => inputRef.current?.click()}
        >
          <span className="size-4 rounded-full border" style={{ backgroundColor: primaryColor }} />
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
    </div>
  )
}
