'use client'

import type { DocToC } from '@/app/[...slug]/DocsContext'
import cn from '@/lib/cn'
import { ComponentProps, useEffect, useMemo, useState } from 'react'
import { withDepth } from './withDepth'

/**
 * Scroll-spy: returns the id of the last heading that entered the top 20% of the viewport, or
 * the first heading's id until one does.
 *
 * Adapted from shadcn/ui (MIT): apps/v4/components/docs-toc.tsx
 */
function useActiveId(ids: string[]) {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '0% 0% -80% 0%' },
    )

    for (const id of ids) {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    }

    return () => {
      observer.disconnect()
    }
  }, [ids])

  return activeId
}

export function Toc({ className, toc }: ComponentProps<'nav'> & { toc: DocToC[] }) {
  const items = useMemo(() => withDepth(toc), [toc])
  const ids = useMemo(() => toc.map((item) => item.id), [toc])
  const activeId = useActiveId(ids)

  if (toc.length === 0) return null

  return (
    <nav aria-label="On this page" className={cn('text-sm', className)}>
      <p className="mb-2 text-on-surface-variant/50">On this page</p>
      <ul
        className={cn(
          'relative',
          // The rail: a 1px line along the whole list
          'before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-outline-variant',
        )}
      >
        {items.map(({ title, id, depth }, index) => (
          <li
            key={`${id}-${index}`}
            data-level={depth}
            data-active={id === activeId}
            className={cn(
              'relative flex h-8 min-w-0 items-center py-1.5 pr-3 pl-4',
              'text-on-surface-variant transition-colors hover:text-on-surface',
              // Indent by depth among the headings present (see withDepth)
              'data-[level=2]:pl-8 data-[level=3]:pl-12 data-[level=4]:pl-16 data-[level=5]:pl-20',
              'data-[active=true]:font-medium data-[active=true]:text-on-surface',
              // The active segment: a darker 1px line over the rail
              'data-[active=true]:after:absolute data-[active=true]:after:inset-y-1 data-[active=true]:after:left-0 data-[active=true]:after:w-px data-[active=true]:after:bg-on-surface',
            )}
          >
            <a href={`#${id}`} title={title} className="block min-w-0 truncate">
              {title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
