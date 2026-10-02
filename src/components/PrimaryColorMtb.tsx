'use client'

import { PrimaryColorPrepaint } from '@/components/PrimaryColorPrepaint'
import { DefaultContrastLevelProvider, useContrastLevel } from '@/hooks/useContrastLevel'
import { DefaultPrimaryColorProvider, usePrimaryColor } from '@/hooks/usePrimaryColor'
import { DefaultSchemeProvider, useScheme } from '@/hooks/useScheme'
import { Mtb } from 'material-theme-builder/react'
import { useDeferredValue, type ComponentProps } from 'react'

/**
 * `Mtb`, seeded with the color the reader picked (see `PrimaryColorPicker`), `source` otherwise:
 * the site's default, which the picker can then bring back. Its contrast likewise: the reader's
 * level (see `ContrastToggle`), `contrast` otherwise; and its scheme (see `SchemeToggle`), `scheme`
 * otherwise.
 *
 * `Mtb` writes its palette into a `<style>`: the server's HTML has the default one, the stored picks
 * replace it right after hydration. Until then, `PrimaryColorPrepaint` shows the picks' palette from
 * the first paint.
 */
export function PrimaryColorMtb({
  source,
  contrast = 0,
  scheme = 'tonalSpot',
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
          <SeededMtb {...config}>
            {/* Right after `Mtb`'s `<style>`, before the page */}
            <PrimaryColorPrepaint
              signature={signature}
              defaultPrimaryColor={source}
              defaultContrastLevel={contrast}
              defaultScheme={scheme}
            />
            {children}
          </SeededMtb>
        </DefaultSchemeProvider>
      </DefaultContrastLevelProvider>
    </DefaultPrimaryColorProvider>
  )
}

function SeededMtb(props: Omit<ComponentProps<typeof Mtb>, 'source' | 'contrast' | 'scheme'>) {
  const [primaryColor] = usePrimaryColor()
  const [contrastLevel] = useContrastLevel()
  const [scheme] = useScheme()
  // Dragging in the native picker changes the color on every move: the swatch follows at once, the
  // palette (and the whole page restyled with it) when React has the time
  const source = useDeferredValue(primaryColor)

  return <Mtb {...props} source={source} contrast={contrastLevel} scheme={scheme} />
}
