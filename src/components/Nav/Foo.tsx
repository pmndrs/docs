'use client'

import { Doc } from '@/app/[...slug]/DocsContext'
import cn from '@/lib/cn'
import * as Collapsible from '@radix-ui/react-collapsible'
import Link from 'next/link'
import { ComponentProps, useState } from 'react'
import { IoIosArrowDown } from 'react-icons/io'

const INDEX_PAGE = 'index'

export function Foo({
  category,
  docs,
  asPath,
}: {
  category: string
  docs: Record<string, Doc>
  asPath: string
}) {
  const docsEntries = Object.entries(docs)
  const indexEntry = docsEntries.find(([page]) => page === INDEX_PAGE)
  const foo = indexEntry ? indexEntry[1].url : '#'

  const [open, setOpen] = useState(true)

  return (
    <Collapsible.Root
      className="CollapsibleRoot [--NavItem-pad:.75rem]"
      open={open}
      onOpenChange={setOpen}
    >
      <div className="relative">
        <NavItem
          href={foo}
          // className="mb-2 mt-8 px-6 text-sm font-bold uppercase tracking-wide text-on-surface-variant/50 lg:text-xs"
          className={cn(
            'mt-8 text-sm font-bold uppercase tracking-wide text-on-surface-variant/50 lg:text-xs',
            'flex items-center gap-3',
          )}
          active={foo === `/${asPath}`}
        >
          {category}
        </NavItem>
        <Collapsible.Trigger
          asChild
          className={cn('absolute right-0 top-1/2 transition-transform', open && 'rotate-90')}
        >
          <div className="-translate-y-1/2 p-[--NavItem-pad]">
            <IoIosArrowDown className="size-4 -rotate-90" />
          </div>
        </Collapsible.Trigger>
      </div>

      <Collapsible.Content className="data-[state=close]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <ul>
          {docsEntries
            .filter(([page]) => page !== INDEX_PAGE)
            .map(([page, doc]) => (
              <li key={page}>
                <NavItem href={doc.url} active={doc.url === `/${asPath}`}>
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
        'block cursor-pointer rounded-r-xl p-[--NavItem-pad] pl-6',
        active ? 'interactive-bg-primary-container' : 'interactive-bg-surface',
        className,
      )}
    >
      {children}
    </Link>
  )
}
