'use client'

import * as React from 'react'
import clsx from 'clsx'
import type { DocToC } from '@/app/[...slug]/DocsContext'

export interface ToCProps {
  toc: DocToC[]
}

function Toc({ toc }: ToCProps) {
  // console.log('toc', toc)
  const [activeIndex, setActiveIndex] = React.useState(0)

  React.useEffect(() => {
    const headings = toc.map((heading) => document.getElementById(heading.id))

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio > 0) {
        const headingIndex = headings.indexOf(entry.target as HTMLElement)
        setActiveIndex(headingIndex)
      }
    })

    for (const heading of headings) {
      if (heading) observer.observe(heading)
    }

    return () => observer.disconnect()
  }, [toc])

  return (
    <div className="max-h-(screen-16) sticky top-16 flex flex-col justify-between overflow-y-auto pb-6">
      <label className="mb-2 mt-12 text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300 lg:text-xs">
        On This Page
      </label>
      {toc.map((item, index) => (
        <h4 key={`${item.title}-${index}`}>
          <a
            aria-label={item.title}
            aria-current={index === activeIndex}
            className={clsx(
              'block py-1 text-sm font-normal leading-6 text-gray-500 hover:underline',
              item.parent && 'ml-4',
              index === activeIndex && 'text-gray-900 dark:text-gray-200',
            )}
            href={`#${item.id}`}
          >
            {item.title}
          </a>
        </h4>
      ))}
    </div>
  )
}

export default Toc
