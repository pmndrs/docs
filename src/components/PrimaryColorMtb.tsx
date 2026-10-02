'use client'

import { PrimaryColorPrepaint } from '@/components/PrimaryColorPrepaint'
import { DefaultPrimaryColorProvider, usePrimaryColor } from '@/hooks/usePrimaryColor'
import { Mtb } from 'material-theme-builder/react'
import { useDeferredValue, type ComponentProps } from 'react'

/**
 * `Mtb`, seeded with the color the reader picked (see `PrimaryColorPicker`), `source` otherwise:
 * the site's default, which the picker can then bring back.
 *
 * `Mtb` writes its palette into a `<style>`: the server's HTML has the default one, the stored pick
 * replaces it right after hydration. Until then, `PrimaryColorPrepaint` shows the pick's palette
 * from the first paint.
 */
export function PrimaryColorMtb({ source, children, ...config }: ComponentProps<typeof Mtb>) {
  // Everything but the color that shapes the palette: the same on the server and the client
  const signature = JSON.stringify(config)

  return (
    <DefaultPrimaryColorProvider value={source}>
      <SeededMtb {...config}>
        {/* Right after `Mtb`'s `<style>`, before the page */}
        <PrimaryColorPrepaint signature={signature} />
        {children}
      </SeededMtb>
    </DefaultPrimaryColorProvider>
  )
}

function SeededMtb(props: Omit<ComponentProps<typeof Mtb>, 'source'>) {
  const [primaryColor] = usePrimaryColor()
  // Dragging in the native picker changes the color on every move: the swatch follows at once, the
  // palette (and the whole page restyled with it) when React has the time
  const source = useDeferredValue(primaryColor)

  return <Mtb {...props} source={source} />
}
