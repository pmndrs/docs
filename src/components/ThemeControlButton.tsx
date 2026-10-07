'use client'

import { Button } from '@/components/ui/button'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import { cn } from '@/lib/utils'
import { useEffect, type ComponentProps } from 'react'

/**
 * The seeds of the palette a reader can override: `THEME_PRIMARY`, `THEME_CONTRAST`, `THEME_SCHEME`
 * and `THEME_COLOR_MATCH`
 */
type Seed = 'primaryColor' | 'contrast' | 'scheme' | 'colorMatch'

/**
 * Set on `<html>` by each seed's pre-paint script when the stored pick overrides it: the button
 * looks overridden from the first paint, until hydrated
 */
export const PREPAINT_OVERRIDDEN_ATTRIBUTES = {
  primaryColor: 'data-prepaint-primary-color-overridden',
  contrast: 'data-prepaint-contrast-overridden',
  scheme: 'data-prepaint-scheme-overridden',
  colorMatch: 'data-prepaint-color-match-overridden',
} as const satisfies Record<Seed, string>

/**
 * Appended to the button's accessible name, and to its tooltip, once the reader overrode the seed:
 * the two ways back
 */
export const RESET_HINT = ', double-click or Delete to reset'

// The overridden look, once hydrated: `data-overridden` on the button. Not a `Button` variant: a
// variant is picked at render, while the first-paint outline comes from the pre-paint attribute
// on `<html>`, through a selector; and `outline` would change the background too
const OVERRIDDEN = 'data-overridden:border-border'

// The attribute without its `data-` prefix, as the `in-data-[...]` variant spells it
type Unprefixed<T> = T extends `data-${infer Name}` ? Name : never

// The same look from the pre-paint attribute. Tailwind needs the classes spelled out; the type
// keeps them in step with the attributes
const PREPAINT_OVERRIDDEN = {
  primaryColor: 'in-data-[prepaint-primary-color-overridden]:border-border',
  contrast: 'in-data-[prepaint-contrast-overridden]:border-border',
  scheme: 'in-data-[prepaint-scheme-overridden]:border-border',
  colorMatch: 'in-data-[prepaint-color-match-overridden]:border-border',
} as const satisfies {
  [S in Seed]: `in-data-[${Unprefixed<(typeof PREPAINT_OVERRIDDEN_ATTRIBUTES)[S]>}]:border-border`
}

type Props = Omit<ComponentProps<typeof Button>, 'variant' | 'size' | 'onDoubleClick'> & {
  /** The seed the button is for: picks the pre-paint attribute it removes once hydrated */
  seed: Seed
  /** The reader overrode the seed: `false` until hydrated, as on the server */
  overridden: boolean
  /** Back to the seed: a double-click, or Delete on the focused button */
  onReset: () => void
}

/**
 * An icon button of `ThemeControls`, for one seed of the palette: a ghost button, outlined once the
 * reader overrode the seed (`data-overridden`), and from the first paint when its pre-paint script
 * found the pick stored. Its accessible name then says how to come back: a double-click (its second
 * click is not a step), or Delete on the focused button.
 */
export function ThemeControlButton({
  seed,
  overridden,
  onReset,
  onClick,
  onKeyDown,
  'aria-label': ariaLabel,
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
      aria-label={overridden ? `${ariaLabel}${RESET_HINT}` : ariaLabel}
      className={cn(OVERRIDDEN, PREPAINT_OVERRIDDEN[seed], className)}
      onClick={(event) => {
        // The second click of a double-click is the reset's: not a step, which would write the
        // store, recompute the palette (a flash) and, for the swatch, open the native picker again
        if (event.detail === 2) return
        onClick?.(event)
      }}
      onDoubleClick={onReset}
      onKeyDown={(event) => {
        // Both keys: on a Mac keyboard the key labelled "delete" sends Backspace, so "Delete" in
        // `RESET_HINT` reads right for both
        if (event.key === 'Delete' || event.key === 'Backspace') {
          event.preventDefault()
          onReset()
          return
        }
        onKeyDown?.(event)
      }}
      {...props}
    />
  )
}
