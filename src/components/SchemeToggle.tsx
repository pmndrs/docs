'use client'

import {
  PREPAINT_OVERRIDDEN_ATTRIBUTES,
  RESET_HINT,
  ThemeControlButton,
} from '@/components/ThemeControlButton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import { SCHEME_KEY, SCHEMES, schemeOf, useScheme } from '@/hooks/useScheme'
import { upperFirst } from 'lodash-es'
import {
  DramaIcon,
  DropletIcon,
  DropletOffIcon,
  ImageIcon,
  PaletteIcon,
  SparklesIcon,
  TargetIcon,
} from 'lucide-react'
import { useEffect } from 'react'

const ICONS = {
  tonalSpot: PaletteIcon,
  vibrant: SparklesIcon,
  expressive: DramaIcon,
  // True to the seed color
  fidelity: TargetIcon,
  // Made for a seed taken from an image
  content: ImageIcon,
  monochrome: DropletOffIcon,
  neutral: DropletIcon,
}

/** Set on `<html>` to the stored scheme before the first paint: the button shows it until hydrated */
const PREPAINT_ATTRIBUTE = 'data-prepaint-scheme'

/**
 * The script run while the HTML is parsed, before the button, `defaultScheme` being the site's
 * default. What isn't one of the schemes is the default; another one overrides it
 */
export function prepaintScript(defaultScheme: string) {
  const values = SCHEMES.map(({ value }) => value)
  return `try {
  var scheme = localStorage.getItem(${JSON.stringify(SCHEME_KEY)})
  if (${JSON.stringify(values)}.indexOf(scheme) === -1) scheme = ${JSON.stringify(defaultScheme)}
  document.documentElement.setAttribute(${JSON.stringify(PREPAINT_ATTRIBUTE)}, scheme)
  if (scheme !== ${JSON.stringify(defaultScheme)}) document.documentElement.setAttribute(${JSON.stringify(PREPAINT_OVERRIDDEN_ATTRIBUTES.scheme)}, '')
} catch (e) {
  document.documentElement.setAttribute(${JSON.stringify(PREPAINT_ATTRIBUTE)}, ${JSON.stringify(defaultScheme)})
}`
}

/**
 * The Material scheme of the site's palette, from tonal spot to neutral: each click goes to the
 * next one. Remembered across pages, reloads and tabs (see `useScheme`). Picking the site's default
 * again, or double-clicking (or Delete on the focused button), forgets the choice.
 */
export function SchemeToggle({ className }: { className?: string }) {
  const [scheme, setScheme, isDefault, reset] = useScheme()
  const isHydrated = useIsHydrated()
  const current = schemeOf(scheme)
  const next = SCHEMES[(SCHEMES.indexOf(current) + 1) % SCHEMES.length]

  // The button reads `scheme` itself once hydrated
  useEffect(() => {
    if (isHydrated) document.documentElement.removeAttribute(PREPAINT_ATTRIBUTE)
  }, [isHydrated])

  // TODO(color-match): hide while color match is on

  const Icon = ICONS[current.value]

  return (
    <>
      {/* Until hydrated, `current` is the site's default, as on the server */}
      {!isHydrated && (
        <script dangerouslySetInnerHTML={{ __html: prepaintScript(current.value) }} />
      )}
      <Tooltip>
        <TooltipTrigger
          render={
            <ThemeControlButton
              seed="scheme"
              overridden={!isDefault}
              onReset={reset}
              aria-label={isHydrated ? `Scheme: ${current.name}, switch to ${next.name}` : 'Scheme'}
              className={className}
              onClick={() => setScheme(next.value)}
            />
          }
        >
          {isHydrated ? (
            <Icon />
          ) : (
            // The stored scheme is unknown on the server, and at hydration: the HTML can't depend on
            // it. Every icon is there, the pre-paint attribute shows the stored scheme's
            <>
              <PaletteIcon className="hidden in-data-[prepaint-scheme=tonalSpot]:block" />
              <SparklesIcon className="hidden in-data-[prepaint-scheme=vibrant]:block" />
              <DramaIcon className="hidden in-data-[prepaint-scheme=expressive]:block" />
              <TargetIcon className="hidden in-data-[prepaint-scheme=fidelity]:block" />
              <ImageIcon className="hidden in-data-[prepaint-scheme=content]:block" />
              <DropletOffIcon className="hidden in-data-[prepaint-scheme=monochrome]:block" />
              <DropletIcon className="hidden in-data-[prepaint-scheme=neutral]:block" />
            </>
          )}
        </TooltipTrigger>
        <TooltipContent>
          {isHydrated ? `${upperFirst(current.name)}${isDefault ? '' : RESET_HINT}` : 'Scheme'}
        </TooltipContent>
      </Tooltip>
    </>
  )
}
