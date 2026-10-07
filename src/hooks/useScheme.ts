import { useStoredChoice } from '@/hooks/useStoredChoice'
import { createRequiredContext } from '@/lib/createRequiredContext'
import type { MtbConfig } from 'material-theme-builder'

/** Where the pick is stored: read before the first paint too, by `PrimaryColorPrepaint` */
export const SCHEME_KEY = 'pmndrs-docs:scheme'

export type SchemeValue = NonNullable<MtbConfig['scheme']>

/**
 * The schemes a reader can pick, in the order a click goes through them: every one
 * material-theme-builder has, in Material's own order (its `Variant`), from its default, tonal spot
 */
export const SCHEMES = [
  { name: 'tonal spot', value: 'tonalSpot' },
  { name: 'vibrant', value: 'vibrant' },
  { name: 'expressive', value: 'expressive' },
  { name: 'fidelity', value: 'fidelity' },
  { name: 'content', value: 'content' },
  { name: 'monochrome', value: 'monochrome' },
  { name: 'neutral', value: 'neutral' },
] as const satisfies readonly { name: string; value: SchemeValue }[]

export type Scheme = (typeof SCHEMES)[number]

const [useDefaultScheme, DefaultSchemeProvider] = createRequiredContext<SchemeValue>()

/**
 * The site's own scheme, `THEME_SCHEME`: only the server knows it, `PrimaryColorMtb` passes it down
 */
export { DefaultSchemeProvider }

/**
 * The scheme stored as `stored`, `null` for anything but one of `SCHEMES`
 *
 * @param stored - the raw stored value, `null` when nothing is stored
 */
export function parseScheme(stored: string | null) {
  const scheme = SCHEMES.find(({ value }) => value === stored)
  return scheme ? scheme.value : null
}

/**
 * The scheme of `value`, the first one for a value it doesn't know
 *
 * @param value - the scheme value to look up
 */
export function schemeOf(value: SchemeValue): Scheme {
  return SCHEMES.find((scheme) => scheme.value === value) ?? SCHEMES[0]
}

/**
 * The scheme the reader picked for the site's Material palette, the site's default otherwise: one
 * choice for the whole page, remembered across pages, reloads and tabs (see `useStoredChoice`).
 *
 * Picking the default, or `reset`, forgets the choice: a later change of the site's default then
 * reaches the reader too.
 */
export function useScheme() {
  const defaultScheme = useDefaultScheme()
  const [stored, setStored] = useStoredChoice(SCHEME_KEY)
  const scheme = parseScheme(stored) ?? defaultScheme
  const isDefault = scheme === defaultScheme

  function setScheme(value: SchemeValue) {
    setStored(value === defaultScheme ? null : value)
  }

  // The site's default again: nothing stored
  function reset() {
    setStored(null)
  }

  return [scheme, setScheme, isDefault, reset] as const
}
