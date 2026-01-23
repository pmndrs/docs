'use client'

import type { DocToC } from '@/app/[...slug]/DocsContext'
import cn from '@/lib/cn'
import { ComponentProps, useCallback, useEffect, useRef, useState } from 'react'

export function Toc({ className, toc }: ComponentProps<'div'> & { toc: DocToC[] }) {
  // console.log('toc', toc)

  const [activeIndex, setActiveIndex] = useState<number | undefined>()
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set())
  const tocRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])

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

  // Progressive navigation with intersection observer
  useEffect(() => {
    const headings = toc.map((heading) => document.getElementById(heading.id))

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleSections((prev) => {
          const newVisibleSections = new Set(prev)

          entries.forEach((entry) => {
            const headingIndex = headings.indexOf(entry.target as HTMLElement)
            if (headingIndex !== -1) {
              if (entry.isIntersecting) {
                newVisibleSections.add(headingIndex)
              } else {
                newVisibleSections.delete(headingIndex)
              }
            }
          })

          return newVisibleSections
        })
      },
      {
        rootMargin: '-80px 0px -80px 0px',
        threshold: 0,
      },
    )

    for (const heading of headings) {
      if (heading) observer.observe(heading)
    }

    return () => observer.disconnect()
  }, [toc])

  // Draw and update SVG path
  useEffect(() => {
    if (!pathRef.current || !tocRef.current || itemRefs.current.length === 0) return

    const drawPath = () => {
      const path: (string | number)[] = []
      let pathIndent = 0
      const itemPositions: { pathStart: number; pathEnd: number }[] = []
      let pathLength = 0

      itemRefs.current.forEach((item, i) => {
        if (!item) return

        const x = item.offsetLeft - 5
        const y = item.offsetTop
        const height = item.offsetHeight

        if (i === 0) {
          path.push('M', x, y, 'L', x, y + height)
        } else {
          if (pathIndent !== x) path.push('L', pathIndent, y)
          path.push('L', x, y)
          path.push('L', x, y + height)
        }

        pathIndent = x
        itemPositions[i] = { pathStart: pathLength, pathEnd: pathLength + height }
        pathLength += height
      })

      pathRef.current?.setAttribute('d', path.join(' '))

      // Update stroke-dasharray based on visible sections
      if (visibleSections.size > 0) {
        const visibleArray = Array.from(visibleSections).sort((a, b) => a - b)
        const pathStart = itemPositions[visibleArray[0]]?.pathStart ?? 0
        const pathEnd = itemPositions[visibleArray[visibleArray.length - 1]]?.pathEnd ?? 0

        if (pathStart < pathEnd) {
          pathRef.current?.setAttribute('stroke-dashoffset', '1')
          pathRef.current?.setAttribute(
            'stroke-dasharray',
            `1, ${pathStart}, ${pathEnd - pathStart}, 1000`,
          )
          pathRef.current?.setAttribute('opacity', '1')
        } else {
          pathRef.current?.setAttribute('opacity', '0')
        }
      } else {
        pathRef.current?.setAttribute('opacity', '0')
      }
    }

    drawPath()

    window.addEventListener('resize', drawPath)
    return () => window.removeEventListener('resize', drawPath)
  }, [visibleSections, toc])

  return (
    <div ref={tocRef} className={cn(className, 'relative text-xs')}>
      <p className="mb-3 font-semibold uppercase tracking-wide text-on-surface-variant/50">
        On This Page
      </p>
      {toc.map(({ title, id, level }, index) => (
        <h4
          key={`${title}-${index}`}
          ref={(el) => {
            itemRefs.current[index] = el
          }}
        >
          <a
            aria-label={title}
            className={cn(
              'block text-balance py-2 text-on-surface-variant/50 hover:underline',
              (index === activeIndex || visibleSections.has(index)) && 'text-on-surface',
            )}
            style={{ marginLeft: `${(level - 1) * 1}rem` }}
            href={`#${id}`}
          >
            {title}
          </a>
        </h4>
      ))}
      <svg
        className="pointer-events-none absolute left-0 top-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          ref={pathRef}
          stroke="currentColor"
          strokeWidth="2"
          fill="transparent"
          strokeDasharray="0, 0, 0, 1000"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0"
          className="text-primary transition-all duration-300 ease-out"
        />
      </svg>
    </div>
  )
}
