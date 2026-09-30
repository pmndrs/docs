'use client'

import { Doc } from '@/app/[...slug]/DocsContext'
import cn from '@/lib/cn'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ComponentProps, useState } from 'react'
import { IoIosArrowDown } from 'react-icons/io'

import Link from 'next/link'

const INDEX_PAGE = 'introduction'

export function NavCategoryCollapsible({
  category,
  docs,
  asPath,
}: {
  category: string
  docs: Record<string, Doc>
  asPath: string
}) {
  const docsEntries = Object.entries(docs)

  const docIndexEntry = docsEntries.find(([page]) => page === INDEX_PAGE)
  const categoryHref = docIndexEntry ? docIndexEntry[1].url : docsEntries[0][1].url

  const [open, setOpen] = useState(docsEntries.some(([, doc]) => doc.url === `/${asPath}`))

  const nonIndexItems = docsEntries.filter(([page]) => page !== INDEX_PAGE)

  return (
    <Collapsible
      className={cn(
        'text-sm [--NavItem-pad:.75rem] [--arrow-size:--spacing(4)]',
        !docsEntries.some(([, doc]) => doc.url === `/${asPath}`) && 'opacity-50',
      )}
      open={open}
      onOpenChange={setOpen}
    >
      <div className="relative">
        <NavItem
          href={categoryHref}
          className={cn('capitalize tracking-wide', 'flex items-center gap-3')}
          active={docIndexEntry && categoryHref === `/${asPath}`}
        >
          {category.replace(/\-/g, ' ')}
        </NavItem>
        {nonIndexItems.length > 0 && (
          <CollapsibleTrigger
            aria-label={category.replace(/\-/g, ' ')}
            className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 p-(--NavItem-pad) transition-transform',
              open && 'rotate-90',
            )}
          >
            <IoIosArrowDown className="size-(--arrow-size) -rotate-90" />
          </CollapsibleTrigger>
        )}
      </div>

      {/* Base UI measures the panel into `--collapsible-panel-height` and flags the first and last
       * frames of the transition, so the height eases in and out of 0. A panel open on the first
       * render does not animate. */}
      <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-starting-style:h-0 data-ending-style:h-0">
        <ul>
          {nonIndexItems.map(([page, doc]) => (
            <li key={page}>
              <NavItem href={doc.url} active={doc.url === `/${asPath}`} className="text-xs">
                {doc.title}
              </NavItem>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

function NavItem({
  children,
  className,
  active,
  ...props
}: {
  active?: boolean
} & ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={cn(
        'block cursor-pointer rounded-r-xl p-(--NavItem-pad) pl-(--rgrid-m) pr-[calc(2*var(--NavItem-pad)+var(--arrow-size))]',
        active ? 'bg-primary-container' : 'bg-surface',
        className,
      )}
    >
      {children}
    </Link>
  )
}
