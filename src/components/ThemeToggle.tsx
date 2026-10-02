'use client'

import { Button } from '@/components/ui/button'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'

// In the order a click goes through them
const THEMES = ['system', 'light', 'dark'] as const

type Theme = (typeof THEMES)[number]

const ICONS = {
  system: MonitorIcon,
  light: SunIcon,
  dark: MoonIcon,
}

// Where next-themes stores the choice: its default `storageKey`
const THEME_KEY = 'theme'

/** Set on `<html>` to the stored choice before the first paint: the button shows it until hydrated */
const PREPAINT_ATTRIBUTE = 'data-prepaint-theme'

function isTheme(value: string | undefined): value is Theme {
  return THEMES.includes(value as Theme)
}

// Run while the HTML is parsed, before the button: next-themes' own script has already put the
// light or dark class on `<html>`, but not whether it was picked or follows the system
const prepaintScript = `try {
  var theme = localStorage.getItem(${JSON.stringify(THEME_KEY)})
  document.documentElement.setAttribute(${JSON.stringify(PREPAINT_ATTRIBUTE)}, theme === 'light' || theme === 'dark' ? theme : 'system')
} catch (e) {
  document.documentElement.setAttribute(${JSON.stringify(PREPAINT_ATTRIBUTE)}, 'system')
}`

/**
 * Light, dark, or following the system: each click goes to the next one. The choice is
 * next-themes', remembered across pages, reloads and tabs.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const isHydrated = useIsHydrated()
  // A stored value next-themes doesn't know is the system's, as next-themes treats it
  const current = isTheme(theme) ? theme : 'system'
  const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]

  // The button reads `theme` itself once hydrated
  useEffect(() => {
    if (isHydrated) document.documentElement.removeAttribute(PREPAINT_ATTRIBUTE)
  }, [isHydrated])

  const Icon = ICONS[current]

  return (
    <>
      {!isHydrated && <script dangerouslySetInnerHTML={{ __html: prepaintScript }} />}
      <Button
        variant="ghost"
        size="icon"
        aria-label={isHydrated ? `Theme: ${current}, switch to ${next}` : 'Theme'}
        className={className}
        onClick={() => setTheme(next)}
      >
        {isHydrated ? (
          <Icon />
        ) : (
          // `theme` is unknown on the server, and the stored one at hydration: the HTML can't depend
          // on it. Every icon is there, the pre-paint attribute shows the stored theme's
          <>
            <MonitorIcon className="hidden in-data-[prepaint-theme=system]:block" />
            <SunIcon className="hidden in-data-[prepaint-theme=light]:block" />
            <MoonIcon className="hidden in-data-[prepaint-theme=dark]:block" />
          </>
        )}
      </Button>
    </>
  )
}
