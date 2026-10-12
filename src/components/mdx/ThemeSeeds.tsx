'use client'

import { ThemeSeedsTable } from '@/components/mdx/ThemeSeedsTable'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useColorMatch } from '@/hooks/useColorMatch'
import { useContrastLevel } from '@/hooks/useContrastLevel'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import { usePrimaryColor } from '@/hooks/usePrimaryColor'
import { useScheme } from '@/hooks/useScheme'
import { useSourcePreset } from '@/hooks/useSourcePreset'
import { Color } from '@/registry/color/color'
import { ChevronDownIcon } from 'lucide-react'
import type { MtbConfig } from 'material-theme-builder'
import { useMtb } from 'material-theme-builder/react'
import { useLayoutEffect, useState } from 'react'

export type SeedPreset = { name: string; label: string; config: MtbConfig }

/**
 * Presets supplied by the consuming repository, previewed by the site's existing theme controls.
 * Source and neutral overrides follow the preset; contrast remains the reader's preference.
 * The table follows the live builder config, including changes made with the footer's controls.
 */
export function ThemeSeeds({ presets }: { presets: SeedPreset[] }) {
  const [source, setSource] = usePrimaryColor()
  const [scheme, setScheme] = useScheme()
  const [colorMatch, setColorMatch] = useColorMatch()
  const [contrast] = useContrastLevel()
  const isHydrated = useIsHydrated()
  const [hasRevealed, setHasRevealed] = useState(false)
  const { mtbConfig } = useMtb()
  const [storedPreset, setSourcePreset] = useSourcePreset()
  const sourcePreset = presets.find(
    ({ config }) => config.source.toLowerCase() === source.toLowerCase(),
  )

  // Remember a named source already chosen through the footer too. The root theme applies
  // these seeds globally; this panel only supplies preset data, never writes the native config.
  useLayoutEffect(() => {
    if (!isHydrated || !sourcePreset) return
    const { source: presetSource, neutral, neutralVariant } = sourcePreset.config
    if (
      storedPreset?.source.toLowerCase() === presetSource.toLowerCase() &&
      storedPreset.neutral === neutral &&
      storedPreset.neutralVariant === neutralVariant
    )
      return
    setSourcePreset(sourcePreset.config)
  }, [isHydrated, sourcePreset, storedPreset, setSourcePreset])

  // Static HTML cannot know stored preferences. Reveal once the native builder has caught up
  // with them, then keep the panel visible throughout normal preset changes.
  useLayoutEffect(() => {
    if (
      hasRevealed ||
      !isHydrated ||
      mtbConfig.source.toLowerCase() !== source.toLowerCase() ||
      mtbConfig.scheme !== scheme ||
      mtbConfig.colorMatch !== colorMatch ||
      mtbConfig.contrast !== contrast ||
      (sourcePreset &&
        (mtbConfig.neutral !== sourcePreset.config.neutral ||
          mtbConfig.neutralVariant !== sourcePreset.config.neutralVariant))
    )
      return
    setHasRevealed(true)
  }, [hasRevealed, isHydrated, mtbConfig, source, scheme, colorMatch, contrast, sourcePreset])
  const selected = presets.find(
    ({ config }) =>
      config.source.toLowerCase() === source.toLowerCase() &&
      (config.scheme ?? 'tonalSpot') === scheme &&
      (config.colorMatch ?? false) === colorMatch,
  )

  function selectPreset(name: string) {
    const preset = presets.find((preset) => preset.name === name)
    if (!preset) return
    setSourcePreset(preset.config)
    setSource(preset.config.source)
    setScheme(preset.config.scheme ?? 'tonalSpot')
    setColorMatch(preset.config.colorMatch ?? false)
  }

  if (!hasRevealed) {
    return (
      <div role="status" aria-label="Loading seed preset">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-3 mb-8 h-74 w-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" aria-label="Seed preset" />}>
            <Color color={source} />
            {selected?.label ?? 'Custom'}
            <ChevronDownIcon data-icon="inline-end" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Seed preset</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={selected?.name ?? ''} onValueChange={selectPreset}>
                {presets.map((preset) => (
                  <DropdownMenuRadioItem key={preset.name} value={preset.name}>
                    <Color color={preset.config.source} />
                    {preset.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ThemeSeedsTable config={mtbConfig} />
    </div>
  )
}
