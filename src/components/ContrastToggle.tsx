'use client'

import {
  PREPAINT_OVERRIDDEN_ATTRIBUTES,
  RESET_HINT,
  ThemeControlButton,
} from '@/components/ThemeControlButton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  CONTRAST_LEVEL_KEY,
  CONTRAST_LEVELS,
  contrastLevelOf,
  useContrastLevel,
} from '@/hooks/useContrastLevel'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import { upperFirst } from 'lodash-es'
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

/**
 * The script run while the HTML is parsed, before the button, `defaultLevelName` being the site's
 * default. What isn't one of the levels is the default's; another one overrides it
 *
 * @param defaultLevelName - the name of the site's default level, one of `CONTRAST_LEVELS`
 */
export function prepaintScript(defaultLevelName: string) {
  const values = CONTRAST_LEVELS.map(({ value }) => String(value))
  const names = CONTRAST_LEVELS.map(({ name }) => name)
  return `try {
  var index = ${JSON.stringify(values)}.indexOf(localStorage.getItem(${JSON.stringify(CONTRAST_LEVEL_KEY)}))
  var name = index === -1 ? ${JSON.stringify(defaultLevelName)} : ${JSON.stringify(names)}[index]
  document.documentElement.setAttribute(${JSON.stringify(PREPAINT_ATTRIBUTE)}, name)
  if (name !== ${JSON.stringify(defaultLevelName)}) document.documentElement.setAttribute(${JSON.stringify(PREPAINT_OVERRIDDEN_ATTRIBUTES.contrast)}, '')
} catch (e) {
  document.documentElement.setAttribute(${JSON.stringify(PREPAINT_ATTRIBUTE)}, ${JSON.stringify(defaultLevelName)})
}`
}

/**
 * The contrast of the site's palette, standard, medium or high: each click goes to the next one.
 * Remembered across pages, reloads and tabs (see `useContrastLevel`). Picking the site's default
 * again, or double-clicking (or Delete on the focused button), forgets the choice.
 */
export function ContrastToggle({ className }: { className?: string }) {
  const [contrastLevel, setContrastLevel, isDefault, reset] = useContrastLevel()
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
      <Tooltip>
        <TooltipTrigger
          render={
            <ThemeControlButton
              seed="contrast"
              overridden={!isDefault}
              onReset={reset}
              aria-label={
                isHydrated ? `Contrast: ${current.name}, switch to ${next.name}` : 'Contrast'
              }
              className={className}
              onClick={() => setContrastLevel(next.value)}
            />
          }
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
        </TooltipTrigger>
        <TooltipContent>
          {isHydrated
            ? `Contrast: ${upperFirst(current.name)}${isDefault ? '' : RESET_HINT}`
            : 'Contrast'}
        </TooltipContent>
      </Tooltip>
    </>
  )
}
