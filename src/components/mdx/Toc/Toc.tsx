'use client'

import type { DocToC } from '@/app/[...slug]/DocsContext'
import cn from '@/lib/cn'
import { useCallback, useEffect, useState } from 'react'

export function Toc({ toc }: { toc: DocToC[] }) {
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

  useEffect(() => {
    const headings = toc.map((heading) => document.getElementById(heading.id))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const headingIndex = headings.indexOf(entry.target as HTMLElement)
            if (headingIndex !== -1) {
              setActiveIndex(headingIndex)
            }
          }
        })
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      },
    )

    for (const heading of headings) {
      if (heading) observer.observe(heading)
    }

    return () => observer.disconnect()
  }, [toc])

  return (
    <div className="max-h-(screen-16) sticky top-16 flex flex-col justify-between overflow-y-auto pb-6">
      <label className="mb-2 mt-12 text-sm font-semibold uppercase tracking-wide text-on-surface-variant/50 lg:text-xs">
        On This Page
      </label>
      {toc.map(({ title, id, level }, index) => (
        <h4 key={`${title}-${index}`}>
          <a
            aria-label={title}
            className={cn(
              'block py-1 text-xs font-normal leading-6 text-on-surface-variant/50 hover:underline',
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
