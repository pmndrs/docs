import { isHexColor } from '@/hooks/usePrimaryColor'
import { useStoredChoice } from '@/hooks/useStoredChoice'
import type { MtbConfig } from 'material-theme-builder'

const SOURCE_PRESET_KEY = 'pmndrs-docs:source-preset'

type SourcePreset = Pick<MtbConfig, 'source' | 'neutral' | 'neutralVariant'>

/** A selected preset's source and neutral seeds, shared by every page's root theme. */
export function useSourcePreset() {
  const [stored, setStored] = useStoredChoice(SOURCE_PRESET_KEY)
  let preset: SourcePreset | null = null
  try {
    const value = stored ? JSON.parse(stored) : null
    if (
      value &&
      isHexColor(value.source) &&
      (value.neutral === undefined || isHexColor(value.neutral)) &&
      (value.neutralVariant === undefined || isHexColor(value.neutralVariant))
    ) {
      preset = {
        source: value.source,
        neutral: value.neutral,
        neutralVariant: value.neutralVariant,
      }
    }
  } catch {
    // Ignore an unavailable or invalid stored preset, as the other theme preferences do.
  }

  function setPreset({ source, neutral, neutralVariant }: SourcePreset) {
    setStored(JSON.stringify({ source, neutral, neutralVariant }))
  }

  return [preset, setPreset] as const
}
