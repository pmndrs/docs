import clsx from 'clsx'
type TocItem = {
  depth: number
  slug: string
  title: string
}

type Toc = TocItem[]

type TocProps = {
  toc: Toc
}

function Toc({ toc }: TocProps) {
  return (
    <div className="flex flex-col justify-between overflow-y-auto sticky max-h-(screen-16) pb-6 top-16">
      <h3 className="mt-8 mb-2 text-lg font-medium text-gray-900 capitalize">On This Page</h3>

      {toc.map((item) => (
        <h3 className={clsx(item.depth === 3 && 'ml-4')}>
          <a
            className="block py-2 text-base font-normal leading-6 text-gray-500 hover:underline"
            href={`#${item.slug}`}
          >
            {item.title}
          </a>
        </h3>
      ))}
    </div>
  )
}

export default Toc
