import { useStoredChoice } from '@/hooks/useStoredChoice'
import { createRequiredContext } from '@/lib/createRequiredContext'

/** Where the pick is stored: read before the first paint too, by `PrimaryColorPrepaint` */
export const COLOR_MATCH_KEY = 'pmndrs-docs:color-match'

const [useDefaultColorMatch, DefaultColorMatchProvider] = createRequiredContext<boolean>()

/**
 * The site's own color match, `THEME_COLOR_MATCH`: only the server knows it, `PrimaryColorMtb`
 * passes it down
 */
export { DefaultColorMatchProvider }

/**
 * The color match stored as `stored`, `null` for anything but `'true'` or `'false'`
 *
 * @param stored - the raw stored value, `null` when nothing is stored
 */
export function parseColorMatch(stored: string | null) {
  if (stored === 'true') return true
  if (stored === 'false') return false
  return null
}

/**
 * Whether the reader wants the site's Material palette true to its seed color
 * (material-theme-builder's `colorMatch`, Material Theme Builder's "Stay true to my color inputs"),
 * the site's default otherwise: one choice for the whole page, remembered across pages, reloads
 * and tabs (see `useStoredChoice`).
 *
 * Picking the default, or `reset`, forgets the choice: a later change of the site's default then
 * reaches the reader too.
 */
export function useColorMatch() {
  const defaultColorMatch = useDefaultColorMatch()
  const [stored, setStored] = useStoredChoice(COLOR_MATCH_KEY)
  const colorMatch = parseColorMatch(stored) ?? defaultColorMatch
  const isDefault = colorMatch === defaultColorMatch

  function setColorMatch(value: boolean) {
    setStored(value === defaultColorMatch ? null : String(value))
  }

  // The site's default again: nothing stored
  function reset() {
    setStored(null)
  }

  return [colorMatch, setColorMatch, isDefault, reset] as const
}
