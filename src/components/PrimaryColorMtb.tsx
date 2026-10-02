'use client'

import { DefaultPrimaryColorProvider, usePrimaryColor } from '@/hooks/usePrimaryColor'
import { Mtb } from 'material-theme-builder/react'
import { useDeferredValue, type ComponentProps } from 'react'

/**
 * `Mtb`, seeded with the color the reader picked (see `PrimaryColorPicker`), `source` otherwise:
 * the site's default, which the picker can then bring back.
 *
 * `Mtb` writes its palette into a `<style>`: the server's HTML has the default one, the stored pick
 * replaces it right after hydration.
 */
export function PrimaryColorMtb({ source, ...props }: ComponentProps<typeof Mtb>) {
  return (
    <DefaultPrimaryColorProvider value={source}>
      <SeededMtb {...props} />
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
