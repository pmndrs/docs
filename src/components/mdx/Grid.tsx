'use client'

import cn from '@/lib/cn'
import { useEffect } from 'react'

/**
 * @deprecated This component is deprecated. Use native HTML with Tailwind CSS grid utilities instead.
 * See https://tailwindcss.com/docs/grid-template-columns for more information.
 *
 * Example migration:
 * Old: <Grid cols={2}><li>...</li></Grid>
 * New: <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 grid-list text-sm mb-4"><li>...</li></ul>
 */
export const Grid = ({ children, cols = 4 }: { children: React.ReactNode; cols?: number }) => {
  useEffect(() => {
    console.warn(
      '⚠️ Grid component is deprecated. Please use native HTML with Tailwind CSS grid utilities instead. ' +
        'See https://tailwindcss.com/docs/grid-template-columns',
    )
  }, [])

  return (
    <div>
      <ul
        className={cn(
          'grid sm:grid-cols-2',
          cols === 4
            ? 'md:grid-cols-4'
            : cols === 3
              ? 'md:grid-cols-3'
              : cols === 2
                ? 'md:grid-cols-2'
                : 'md:grid-cols-1',
          `grid-list gap-4 text-sm`,
        )}
        style={{ marginBottom: '1rem' }}
      >
        {children}
      </ul>
    </div>
  )
}
