import { useStoredChoice } from '@/hooks/useStoredChoice'
import { createRequiredContext } from '@/lib/createRequiredContext'

/** Where the pick is stored: read before the first paint too, by `PrimaryColorPrepaint` */
export const CONTRAST_LEVEL_KEY = 'pmndrs-docs:contrast-level'

/** The levels a reader can pick, in the order a click goes through them: Material's own three */
export const CONTRAST_LEVELS = [
  { name: 'standard', value: 0 },
  { name: 'medium', value: 0.5 },
  { name: 'high', value: 1 },
] as const

export type ContrastLevel = (typeof CONTRAST_LEVELS)[number]

// The site's own contrast, `THEME_CONTRAST`: only the server knows it, `PrimaryColorMtb` passes it
// down
const [useDefaultContrastLevel, DefaultContrastLevelProvider] = createRequiredContext<number>()

export { DefaultContrastLevelProvider }

/** The level stored as `stored`, `null` for anything but one of `CONTRAST_LEVELS` */
export function parseContrastLevel(stored: string | null) {
  const level = CONTRAST_LEVELS.find(({ value }) => String(value) === stored)
  return level ? level.value : null
}

/**
 * The level of `contrast`, or the nearest one: the site's default can be any contrast from -1 to 1
 */
export function contrastLevelOf(contrast: number): ContrastLevel {
  let nearest: ContrastLevel = CONTRAST_LEVELS[0]
  for (const level of CONTRAST_LEVELS) {
    if (Math.abs(level.value - contrast) < Math.abs(nearest.value - contrast)) nearest = level
  }
  return nearest
}

/**
 * The contrast level the reader picked for the site's Material palette, the site's default
 * otherwise: one choice for the whole page, remembered across pages, reloads and tabs (see
 * `useStoredChoice`).
 *
 * Picking the default, or `reset`, forgets the choice: a later change of the site's default then
 * reaches the reader too.
 */
export function useContrastLevel() {
  const defaultContrastLevel = useDefaultContrastLevel()
  const [stored, setStored] = useStoredChoice(CONTRAST_LEVEL_KEY)
  const contrastLevel = parseContrastLevel(stored) ?? defaultContrastLevel
  const isDefault = contrastLevel === defaultContrastLevel

  function setContrastLevel(contrast: number) {
    setStored(contrast === defaultContrastLevel ? null : String(contrast))
  }

  // The site's default again: nothing stored
  function reset() {
    setStored(null)
  }

  return [contrastLevel, setContrastLevel, isDefault, reset] as const
}
