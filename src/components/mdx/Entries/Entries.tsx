import { ComponentProps, Fragment, ReactElement } from 'react'

import { CodesandboxIcon } from '@/components/brand-icons'
import { a as Link } from '@/components/mdx'
import { groupBy } from 'lodash-es'
import { Img } from '../Img'
import { sandboxUrl, type Box } from '../Codesandbox'

/**
 * A documentation page and the sandboxes offered alongside its destination.
 */
export type Entry = {
  /** Rich frontmatter title. */
  title: ReactElement
  /** Page destination. */
  url: string
  /** Path segments, starting with the directory group. */
  slug: string[]
  /** Independent sandbox destinations and optional author thumbnails. */
  boxes: Box[]
}

/**
 * Renders a compact grouped directory with independent page and sandbox links.
 */
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
                  <li key={url} className="my-2 flex break-inside-avoid flex-wrap gap-1">
                    <Link href={url} className="min-w-0 max-w-full break-words">
                      {title}
                    </Link>
                    <span className="inline-flex max-w-full flex-wrap gap-1">
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
