'use client'

import {
  PREPAINT_OVERRIDDEN_ATTRIBUTES,
  RESET_HINT,
  ThemeControlButton,
} from '@/components/ThemeControlButton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { COLOR_MATCH_KEY, useColorMatch } from '@/hooks/useColorMatch'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import { upperFirst } from 'lodash-es'
import { BlendIcon, PipetteIcon } from 'lucide-react'
import { useEffect } from 'react'

const ICONS = {
  // The seed color as is, as a pipette takes it
  on: PipetteIcon,
  // Blended into the scheme
  off: BlendIcon,
}

/** The name of a color match, as the attribute and the accessible name spell it */
function nameOf(colorMatch: boolean) {
  return colorMatch ? 'on' : 'off'
}

/** Set on `<html>` to the stored pick before the first paint: the button shows it until hydrated */
const PREPAINT_ATTRIBUTE = 'data-prepaint-color-match'

// The attribute without its `data-` prefix, as the `in-data-[...]` variant spells it
type Unprefixed<T> = T extends `data-${infer Name}` ? Name : never

/**
 * Hides a control that has no effect while color match is on (the scheme toggle), from the first
 * paint: the stored pick is unknown to the server, the pre-paint attribute says it. Inert once
 * hydrated, the attribute gone: the control then hides itself. Tailwind needs the class spelled
 * out; the type keeps it in step with the attribute
 */
export const PREPAINT_HIDDEN_WHILE_ON =
  'in-data-[prepaint-color-match=on]:hidden' satisfies `in-data-[${Unprefixed<typeof PREPAINT_ATTRIBUTE>}=on]:hidden`

/**
 * The script run while the HTML is parsed, before the button, `defaultColorMatch` being the site's
 * default. What isn't `'true'` or `'false'` is the default; the other one overrides it
 *
 * @param defaultColorMatch The site's own color match, `THEME_COLOR_MATCH`
 */
export function prepaintScript(defaultColorMatch: boolean) {
  const defaultName = nameOf(defaultColorMatch)
  return `try {
  var stored = localStorage.getItem(${JSON.stringify(COLOR_MATCH_KEY)})
  var name = stored === 'true' ? 'on' : stored === 'false' ? 'off' : ${JSON.stringify(defaultName)}
  document.documentElement.setAttribute(${JSON.stringify(PREPAINT_ATTRIBUTE)}, name)
  if (name !== ${JSON.stringify(defaultName)}) document.documentElement.setAttribute(${JSON.stringify(PREPAINT_OVERRIDDEN_ATTRIBUTES.colorMatch)}, '')
} catch (e) {
  document.documentElement.setAttribute(${JSON.stringify(PREPAINT_ATTRIBUTE)}, ${JSON.stringify(defaultName)})
}`
}

/**
 * Whether the site's palette stays true to its seed color, on or off: each click flips it. On, the
 * core colors keep the seed's own chroma (the content variant of each), whatever the scheme says;
 * off, they are blended into the scheme. Remembered across pages, reloads and tabs (see
 * `useColorMatch`). Picking the site's default again, or double-clicking (or Delete on the focused
 * button), forgets the choice.
 *
 * While on, `SchemeToggle` hides: `colorMatch` takes precedence over `scheme` in
 * material-theme-builder, so a click on it would change nothing. The reader's scheme stays stored,
 * and applies again once color match is off.
 */
export function ColorMatchToggle({ className }: { className?: string }) {
  const [colorMatch, setColorMatch, isDefault, reset] = useColorMatch()
  const isHydrated = useIsHydrated()
  const current = nameOf(colorMatch)
  const next = nameOf(!colorMatch)

  // The button reads `colorMatch` itself once hydrated
  useEffect(() => {
    if (isHydrated) document.documentElement.removeAttribute(PREPAINT_ATTRIBUTE)
  }, [isHydrated])

  const Icon = ICONS[current]

  return (
    <>
      {/* Until hydrated, `colorMatch` is the site's default, as on the server */}
      {!isHydrated && <script dangerouslySetInnerHTML={{ __html: prepaintScript(colorMatch) }} />}
      <Tooltip>
        <TooltipTrigger
          render={
            <ThemeControlButton
              seed="colorMatch"
              overridden={!isDefault}
              onReset={reset}
              aria-label={isHydrated ? `Color match: ${current}, switch to ${next}` : 'Color match'}
              className={className}
              onClick={() => setColorMatch(!colorMatch)}
            />
          }
        >
          {isHydrated ? (
            <Icon />
          ) : (
            // The stored pick is unknown on the server, and at hydration: the HTML can't depend on
            // it. Both icons are there, the pre-paint attribute shows the stored pick's
            <>
              <PipetteIcon className="hidden in-data-[prepaint-color-match=on]:block" />
              <BlendIcon className="hidden in-data-[prepaint-color-match=off]:block" />
            </>
          )}
        </TooltipTrigger>
        <TooltipContent>
          {isHydrated
            ? `Color match: ${upperFirst(current)}${isDefault ? '' : RESET_HINT}`
            : 'Color match'}
        </TooltipContent>
      </Tooltip>
    </>
  )
}
