'use client'

import type { DocToC } from '@/app/[...slug]/DocsContext'
import { cn } from '@/lib/utils'
import { ComponentProps, useCallback, useEffect, useState } from 'react'

export function Toc({ className, toc }: ComponentProps<'div'> & { toc: DocToC[] }) {
  // console.log('toc', toc)

  const [activeIndex, setActiveIndex] = useState<number | undefined>()

  const updateActiveIndex = useCallback(
    (hash: string) => {
      const index = toc.findIndex((item) => item.id === hash.slice(1))
      if (index !== -1) {
        setActiveIndex(index)
      }
    },
    [toc],
  )

  useEffect(() => {
    updateActiveIndex(window.location.hash)

    const onHashChanged = (e: HashChangeEvent) => {
      updateActiveIndex(new URL(e.newURL).hash)
    }

    window.addEventListener('hashchange', onHashChanged)
    return () => {
      window.removeEventListener('hashchange', onHashChanged)
    }
  }, [updateActiveIndex])

  // React.useEffect(() => {
  //   const headings = toc.map((heading) => document.getElementById(heading.id))

  //   const observer = new IntersectionObserver(([entry]) => {
  //     if (entry.intersectionRatio > 0) {
  //       const headingIndex = headings.indexOf(entry.target as HTMLElement)
  //       setActiveIndex(headingIndex)
  //     }
  //   })

  //   for (const heading of headings) {
  //     if (heading) observer.observe(heading)
  //   }

  //   return () => observer.disconnect()
  // }, [toc])

  return (
    <div className={cn(className, 'text-xs')}>
      <p className="mb-3 font-semibold uppercase tracking-wide text-on-surface-variant/50">
        On This Page
      </p>
      {toc.map(({ title, id, level }, index) => (
        <h4 key={`${title}-${index}`}>
          <a
            aria-label={title}
            className={cn(
              'block text-balance py-2 text-on-surface-variant/50 hover:underline',
              index === activeIndex && 'text-on-surface',
            )}
            style={{ marginLeft: `${(level - 1) * 1}rem` }}
            href={`#${id}`}
          >
            {title}
          </a>
        </h4>
      ))}
    </div>
  )
}
