'use client'

import { PrimaryColorPrepaint } from '@/components/PrimaryColorPrepaint'
import { DefaultColorMatchProvider, useColorMatch } from '@/hooks/useColorMatch'
import { DefaultContrastLevelProvider, useContrastLevel } from '@/hooks/useContrastLevel'
import { DefaultPrimaryColorProvider, usePrimaryColor } from '@/hooks/usePrimaryColor'
import { DefaultSchemeProvider, useScheme } from '@/hooks/useScheme'
import { Mtb } from 'material-theme-builder/react'
import { useDeferredValue, type ComponentProps } from 'react'

/**
 * `Mtb`, seeded with the color the reader picked (see `PrimaryColorPicker`), `source` otherwise:
 * the site's default, which the picker can then bring back. Its contrast likewise: the reader's
 * level (see `ContrastToggle`), `contrast` otherwise; its scheme (see `SchemeToggle`), `scheme`
 * otherwise; and its color match (see `ColorMatchToggle`), `colorMatch` otherwise.
 *
 * `Mtb` writes its palette into a `<style>`: the server's HTML has the default one, the stored picks
 * replace it right after hydration. Until then, `PrimaryColorPrepaint` shows the picks' palette from
 * the first paint.
 */
export function PrimaryColorMtb({
  source,
  contrast = 0,
  scheme = 'tonalSpot',
  colorMatch = false,
  children,
  ...config
}: ComponentProps<typeof Mtb>) {
  // Everything but what the reader picks that shapes the palette: the same on the server and the
  // client
  const signature = JSON.stringify(config)

  return (
    <DefaultPrimaryColorProvider value={source}>
      <DefaultContrastLevelProvider value={contrast}>
        <DefaultSchemeProvider value={scheme}>
          <DefaultColorMatchProvider value={colorMatch}>
            <SeededMtb {...config}>
              {/* Right after `Mtb`'s `<style>`, before the page */}
              <PrimaryColorPrepaint
                signature={signature}
                defaultPrimaryColor={source}
                defaultContrastLevel={contrast}
                defaultScheme={scheme}
                defaultColorMatch={colorMatch}
              />
              {children}
            </SeededMtb>
          </DefaultColorMatchProvider>
        </DefaultSchemeProvider>
      </DefaultContrastLevelProvider>
    </DefaultPrimaryColorProvider>
  )
}

function SeededMtb(
  props: Omit<ComponentProps<typeof Mtb>, 'source' | 'contrast' | 'scheme' | 'colorMatch'>,
) {
  const [primaryColor] = usePrimaryColor()
  const [contrastLevel] = useContrastLevel()
  const [scheme] = useScheme()
  const [colorMatch] = useColorMatch()
  // Dragging in the native picker changes the color on every move: the swatch follows at once, the
  // palette (and the whole page restyled with it) when React has the time
  const source = useDeferredValue(primaryColor)

  return (
    <Mtb
      {...props}
      source={source}
      contrast={contrastLevel}
      scheme={scheme}
      colorMatch={colorMatch}
    />
  )
}
