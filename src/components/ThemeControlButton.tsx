'use client'

import { Button } from '@/components/ui/button'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import cn from '@/lib/cn'
import { useEffect, type ComponentProps } from 'react'

/** The seeds of the palette a reader can override: `THEME_PRIMARY`, `THEME_CONTRAST`, `THEME_SCHEME` */
export type Seed = 'primaryColor' | 'contrast' | 'scheme'

/**
 * Set on `<html>` by each seed's pre-paint script when the stored pick overrides it: the button
 * looks overridden from the first paint, until hydrated
 */
export const PREPAINT_OVERRIDDEN_ATTRIBUTES = {
  primaryColor: 'data-prepaint-primary-color-overridden',
  contrast: 'data-prepaint-contrast-overridden',
  scheme: 'data-prepaint-scheme-overridden',
} as const satisfies Record<Seed, string>

/** For the button's accessible name and tooltip, once the reader overrode the seed */
export const RESET_HINT = ', double-click to reset'

/** The overridden look, once hydrated: `data-overridden` on the button */
const OVERRIDDEN = 'data-overridden:border-border'

// The same look from the pre-paint attribute: spelled out, for Tailwind to see each class
const PREPAINT_OVERRIDDEN = {
  primaryColor: 'in-data-[prepaint-primary-color-overridden]:border-border',
  contrast: 'in-data-[prepaint-contrast-overridden]:border-border',
  scheme: 'in-data-[prepaint-scheme-overridden]:border-border',
} as const satisfies Record<Seed, string>

type Props = Omit<ComponentProps<typeof Button>, 'variant' | 'size'> & {
  seed: Seed
  /** The reader overrode the seed: `false` until hydrated, as on the server */
  overridden: boolean
  /** Back to the seed: a double-click */
  onReset: () => void
}

/**
 * An icon button of `ThemeControls`, for one seed of the palette: a ghost button, outlined once the
 * reader overrode the seed (`data-overridden`), and from the first paint when its pre-paint script
 * found the pick stored. A double-click brings the seed back; its second click is not a step.
 */
export function ThemeControlButton({
  seed,
  overridden,
  onReset,
  onClick,
  className,
  ...props
}: Props) {
  const isHydrated = useIsHydrated()

  // The button reads `overridden` itself once hydrated
  useEffect(() => {
    if (isHydrated) document.documentElement.removeAttribute(PREPAINT_OVERRIDDEN_ATTRIBUTES[seed])
  }, [isHydrated, seed])

  return (
    <Button
      variant="ghost"
      size="icon"
      data-overridden={overridden ? '' : undefined}
      className={cn(OVERRIDDEN, PREPAINT_OVERRIDDEN[seed], className)}
      onClick={(event) => {
        // The second click of a double-click is the reset's
        if (event.detail === 2) return
        onClick?.(event)
      }}
      onDoubleClick={onReset}
      {...props}
    />
  )
}
