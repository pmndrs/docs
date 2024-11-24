import { ComponentProps } from 'react'

import { groupBy } from 'lodash-es'
import { Codesandbox1 } from '../Codesandbox'

type Entry = {
  title: string
  url: string
  slug: string[]
  boxes: string[]
}

export async function Entries({
  items,
  excludedGroups = ['getting-started'],
  ...props
}: { items: Entry[]; excludedGroups?: string[] } & ComponentProps<'div'>) {
  const groupedEntries = groupBy(items, ({ slug }) => slug[0])

  return (
    <div className="my-8 columns-2 md:columns-3" {...props}>
      {Object.entries(groupedEntries)
        .filter(([group]) => !excludedGroups.includes(group))
        .map(([group, entries]) => {
          return (
            <>
              <h2 className="my-8 text-xl capitalize first-of-type:mt-0">{group}</h2>
              <ul className="text-sm">
                {entries?.map(({ title, url, boxes }) => (
                  <li key={url} className="flex gap-1">
                    <a href={url} className="text-primary">
                      {title}
                    </a>
                    <ul className="inline-flex gap-1">
                      {boxes.map((id) => (
                        <li key={id}>
                          <Codesandbox1
                            key={id}
                            id={id}
                            boxes={[id]}
                            hideTitle
                            className="inline-block"
                            imgProps={{ className: 'h-[1em] w-auto rounded-[1px]' }}
                          />
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </>
          )
        })}
    </div>
  )
}
