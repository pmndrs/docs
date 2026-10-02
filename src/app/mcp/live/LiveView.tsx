'use client'

import { McpLive } from './_components/McpLive'
import { formatSelection, parseSelection, type Selection } from './_components/selection'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

/**
 * `<McpLive>` full size, its selection in the URL so it can be linked to: `?lib=drei`, or
 * `?lib=drei,uikit` for several.
 */
export function LiveView({ basePath }: { basePath: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const param = searchParams.get('lib')
  const selection = useMemo(() => parseSelection(param), [param])

  const setSelection = useCallback(
    (next: Selection) => {
      const params = new URLSearchParams(searchParams)
      const lib = formatSelection(next)
      if (lib) params.set('lib', lib)
      else params.delete('lib')
      // Commas stay readable: they are allowed in a query string
      const query = params.toString().replaceAll('%2C', ',')
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  return (
    <McpLive
      variant="full"
      basePath={basePath}
      selection={selection}
      onSelectionChange={setSelection}
    />
  )
}
