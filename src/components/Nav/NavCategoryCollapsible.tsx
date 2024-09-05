'use client'

import { Doc } from '@/app/[...slug]/DocsContext'
import cn from '@/lib/cn'
import * as Collapsible from '@radix-ui/react-collapsible'
import { ComponentProps, useEffect, useState } from 'react'
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

  useEffect(() => {
    const dur = '.2s'
    document.documentElement.style.setProperty('--collapsible-down-duration', dur)
    document.documentElement.style.setProperty('--collapsible-up-duration', dur)
  }, [])

  const nonIndexItems = docsEntries.filter(([page]) => page !== INDEX_PAGE)

  return (
    <Collapsible.Root
      className={cn(
        'text-sm [--NavItem-pad:.75rem] [--arrow-size:theme(spacing.4)]',
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
          <Collapsible.Trigger
            asChild
            className={cn('absolute right-0 top-1/2 transition-transform', open && 'rotate-90')}
          >
            <div className="-translate-y-1/2 p-[--NavItem-pad]">
              <IoIosArrowDown className="size-[--arrow-size] -rotate-90" />
            </div>
          </Collapsible.Trigger>
        )}
      </div>

      <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <ul>
          {nonIndexItems.map(([page, doc]) => (
            <li key={page}>
              <NavItem href={doc.url} active={doc.url === `/${asPath}`} className="text-xs">
                {doc.title}
              </NavItem>
            </li>
          ))}
        </ul>
      </Collapsible.Content>
    </Collapsible.Root>
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
        'block cursor-pointer rounded-r-xl p-[--NavItem-pad] pl-[--rgrid-m] pr-[calc(2*var(--NavItem-pad)+var(--arrow-size))]',
        active ? 'interactive-bg-primary-container' : 'interactive-bg-surface',
        className,
      )}
    >
      {children}
    </Link>
  )
}
