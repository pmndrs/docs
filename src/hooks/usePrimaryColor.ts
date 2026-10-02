import { useStoredChoice } from '@/hooks/useStoredChoice'
import { createRequiredContext } from '@/lib/createRequiredContext'

const STORAGE_KEY = 'pmndrs-docs:primary-color'

// The site's own seed color, `THEME_PRIMARY`: only the server knows it, `PrimaryColorMtb` passes
// it down
const [useDefaultPrimaryColor, DefaultPrimaryColorProvider] = createRequiredContext<string>()

export { DefaultPrimaryColorProvider }

// What `<input type="color">` gives, and the only form it takes back
const HEX_COLOR = /^#[0-9a-f]{6}$/i

export function isHexColor(value: string | null): value is string {
  return value !== null && HEX_COLOR.test(value)
}

/**
 * The color the reader picked to seed the site's Material palette, the site's default otherwise:
 * one choice for the whole page, remembered across pages, reloads and tabs (see `useStoredChoice`).
 *
 * Picking the default, or `null`, forgets the choice: a later change of the site's default then
 * reaches the reader too.
 */
export function usePrimaryColor() {
  const defaultPrimaryColor = useDefaultPrimaryColor()
  const [stored, setStored] = useStoredChoice(STORAGE_KEY)
  const primaryColor = isHexColor(stored) ? stored : defaultPrimaryColor
  const isDefault = primaryColor.toLowerCase() === defaultPrimaryColor.toLowerCase()

  function setPrimaryColor(color: string | null) {
    const isDefaultColor = color?.toLowerCase() === defaultPrimaryColor.toLowerCase()
    setStored(color === null || isDefaultColor ? null : color)
  }

  return [primaryColor, setPrimaryColor, isDefault] as const
}
