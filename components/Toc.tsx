import clsx from 'clsx'
import { RefObject, useState, useEffect } from 'react'

type TocItem = {
  depth: number
  slug: string
  title: string
  label: string
}

type Toc = TocItem[]

type TocProps = {
  contentRef: RefObject<Element>
  toc: Toc
}

function Toc({ contentRef, toc }: TocProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const headings = Array.from(contentRef.current.querySelectorAll('h2, h3, h4'))

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const headingIndex = headings.indexOf(entry.target)
          setActiveIndex(headingIndex)
        }
      },
      {
        rootMargin: '0px 0px -40% 0px',
      }
    )
    headings.forEach((element) => observer.observe(element as Element))

    return () => observer.disconnect()
  }, [contentRef])

  return (
    <div className="flex flex-col justify-between overflow-y-auto sticky max-h-(screen-16) pb-6 top-16">
      <h5 className="text-gray-900 uppercase tracking-wide font-semibold mt-12 mb-2 text-sm lg:text-xs">
        On This Page
      </h5>
      {toc.map((item, index) => (
        <h4 key={item.slug} className={clsx(item.depth > 2 && 'ml-4')}>
          <a
            aria-label={item.label}
            aria-current={index === activeIndex}
            className={clsx(
              'block py-1 text-sm font-normal leading-6 text-gray-500 hover:underline',
              index === activeIndex && 'text-gray-900'
            )}
            href={`#${item.slug}`}
          >
            {item.title}
          </a>
        </h4>
      ))}
    </div>
  )
}

export default Toc
