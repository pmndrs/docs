'use client'

import { Button } from '@/components/ui/button'
import {
  CONTRAST_LEVEL_KEY,
  CONTRAST_LEVELS,
  contrastLevelOf,
  useContrastLevel,
} from '@/hooks/useContrastLevel'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import { ContrastIcon } from 'lucide-react'
import { useEffect } from 'react'

// The icon grows with the level
const ICON_SIZES = {
  standard: 'size-4',
  medium: 'size-5',
  high: 'size-6',
}

/** Set on `<html>` to the stored level before the first paint: the button shows it until hydrated */
const PREPAINT_ATTRIBUTE = 'data-prepaint-contrast'

// Run while the HTML is parsed, before the button. What isn't one of the levels is the default's
function prepaintScript(defaultLevelName: string) {
  const values = CONTRAST_LEVELS.map(({ value }) => String(value))
  const names = CONTRAST_LEVELS.map(({ name }) => name)
  return `try {
  var index = ${JSON.stringify(values)}.indexOf(localStorage.getItem(${JSON.stringify(CONTRAST_LEVEL_KEY)}))
  document.documentElement.setAttribute(${JSON.stringify(PREPAINT_ATTRIBUTE)}, index === -1 ? ${JSON.stringify(defaultLevelName)} : ${JSON.stringify(names)}[index])
} catch (e) {
  document.documentElement.setAttribute(${JSON.stringify(PREPAINT_ATTRIBUTE)}, ${JSON.stringify(defaultLevelName)})
}`
}

/**
 * The contrast of the site's palette, standard, medium or high: each click goes to the next one.
 * Remembered across pages, reloads and tabs (see `useContrastLevel`). Picking the site's default
 * again forgets the choice.
 */
export function ContrastToggle({ className }: { className?: string }) {
  const [contrastLevel, setContrastLevel] = useContrastLevel()
  const isHydrated = useIsHydrated()
  const current = contrastLevelOf(contrastLevel)
  const next = CONTRAST_LEVELS[(CONTRAST_LEVELS.indexOf(current) + 1) % CONTRAST_LEVELS.length]

  // The button reads `contrastLevel` itself once hydrated
  useEffect(() => {
    if (isHydrated) document.documentElement.removeAttribute(PREPAINT_ATTRIBUTE)
  }, [isHydrated])

  return (
    <>
      {/* Until hydrated, `current` is the site's default, as on the server */}
      {!isHydrated && <script dangerouslySetInnerHTML={{ __html: prepaintScript(current.name) }} />}
      <Button
        variant="ghost"
        size="icon"
        aria-label={isHydrated ? `Contrast: ${current.name}, switch to ${next.name}` : 'Contrast'}
        className={className}
        onClick={() => setContrastLevel(next.value)}
      >
        {isHydrated ? (
          <ContrastIcon className={ICON_SIZES[current.name]} />
        ) : (
          // The stored level is unknown on the server, and at hydration: the HTML can't depend on
          // it. Every size is there, the pre-paint attribute shows the stored level's
          <>
            <ContrastIcon className="hidden size-4 in-data-[prepaint-contrast=standard]:block" />
            <ContrastIcon className="hidden size-5 in-data-[prepaint-contrast=medium]:block" />
            <ContrastIcon className="hidden size-6 in-data-[prepaint-contrast=high]:block" />
          </>
        )}
      </Button>
    </>
  )
}
