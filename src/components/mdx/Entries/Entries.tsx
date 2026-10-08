import { ComponentProps, Fragment, ReactElement } from 'react'

import { CodesandboxIcon } from '@/components/brand-icons'
import { a as Link } from '@/components/mdx'
import { groupBy } from 'lodash-es'
import { Img } from '../Img'
import { sandboxUrl, type Box } from '../Codesandbox'

export type Entry = {
  title: ReactElement
  url: string
  slug: string[]
  boxes: Box[]
}

export async function Entries({
  items,
  excludedGroups = [],
  ...props
}: { items: Entry[]; excludedGroups?: string[] } & ComponentProps<'div'>) {
  const groupedEntries = groupBy(items, ({ slug }) => slug[0])

  return (
    <div className="my-8 columns-2 md:columns-3" {...props}>
      {Object.entries(groupedEntries)
        .filter(([group]) => !excludedGroups.includes(group))
        .map(([group, entries]) => {
          return (
            <Fragment key={group}>
              <h2 className="my-8 text-xl capitalize first-of-type:mt-0">{group}</h2>
              <ul className="text-sm">
                {entries?.map(({ title, url, boxes }) => (
                  <li key={url} className="flex gap-1">
                    <Link href={url}>{title}</Link>
                    <span className="inline-flex gap-1">
                      {boxes.map(({ id, img }, i) => (
                        <a
                          key={i} // a page may show the same sandbox twice
                          href={sandboxUrl(id)}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`CodeSandbox ${id}`}
                          className="inline-flex items-center"
                        >
                          {img ? (
                            <Img src={img} className="h-[1em] w-auto rounded-[1px]" />
                          ) : (
                            <CodesandboxIcon
                              className="size-[1em] text-on-surface-variant"
                              aria-hidden
                            />
                          )}
                        </a>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </Fragment>
          )
        })}
    </div>
  )
}
