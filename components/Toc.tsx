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
    <div className="flex flex-col justify-between overflow-y-auto sticky max-h-(screen-16) pt-10 pb-6 top-16">
      <h3 className="text-xs font-bold uppercase">On this page</h3>

      {/* Extract this to a component */}
      {toc.map((item) => (
        <h3 className={item.depth === 3 && 'ml-4'}>
          <a href={`#${item.slug}`}>{item.title}</a>
        </h3>
      ))}

      {/* Link to the markdown file on github */}
      <div className="mt-4 font-bold">
        <a href="#">🐙 Edit on Github</a>
      </div>
    </div>
  )
}

export default Toc
