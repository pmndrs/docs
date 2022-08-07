import * as React from 'react'
import clsx from 'clsx'
import type { TocItem } from 'utils/rehype'

export interface ToCProps {
  toc: TocItem[]
}

function Toc({ toc }: ToCProps) {
  const [activeIndex, setActiveIndex] = React.useState(0)

  React.useEffect(() => {
    const headings = toc.map(({ id }) => document.getElementById(id))

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const headingIndex = headings.indexOf(entry.target as HTMLElement)
          setActiveIndex(headingIndex)
        }
      },
      {
        rootMargin: '0px 0px -40% 0px',
      }
    )
    headings.forEach((element) => observer.observe(element as Element))

    return () => observer.disconnect()
  }, [toc])

  return (
    <div className="flex flex-col justify-between overflow-y-auto sticky max-h-(screen-16) pb-6 top-16">
      <h5 className="text-gray-900 uppercase tracking-wide font-semibold mt-12 mb-2 text-sm lg:text-xs">
        On This Page
      </h5>
      {toc.map((item, index) => (
        <h4 key={item.id}>
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
