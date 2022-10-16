import * as React from 'react'
import clsx from 'clsx'
import type { DocToC } from 'hooks/useDocs'

export interface ToCProps {
  toc: DocToC[]
}

function Toc({ toc }: ToCProps) {
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
    <div className="flex flex-col justify-between overflow-y-auto sticky max-h-(screen-16) pb-6 top-16">
      <label className="text-gray-900 uppercase tracking-wide font-semibold mt-12 mb-2 text-sm lg:text-xs">
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
              index === activeIndex && 'text-gray-900'
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
