import clsx from 'clsx'

type TocItem = {
  depth: number
  slug: string
  title: string
  label: string
}

type Toc = TocItem[]

type TocProps = {
  toc: Toc
}

function Toc({ toc }: TocProps) {
  return (
    <div className="flex flex-col justify-between overflow-y-auto sticky max-h-(screen-16) pb-6 top-16">
      <h5 className="text-gray-900 uppercase tracking-wide font-semibold mt-12 mb-2 text-sm lg:text-xs">
        On This Page
      </h5>
      {toc.map((item) => (
        <h4 key={item.slug} className={clsx(item.depth === 3 && 'ml-4')}>
          <a
            aria-label={item.label}
            className="block py-1 text-sm font-normal leading-6 text-gray-500 hover:underline"
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
