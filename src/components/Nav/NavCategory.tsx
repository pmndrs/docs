import { Doc } from '@/app/[...slug]/DocsContext'
import cn from '@/lib/cn'
import Link from 'next/link'
import { ComponentProps } from 'react'

const INDEX_PAGE = 'introduction'

export function NavCategory({
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

  const nonIndexItems = docsEntries.filter(([page]) => page !== INDEX_PAGE)

  return (
    <div
      className={cn(
        'text-sm',
        // !docsEntries.some(([, doc]) => doc.url === `/${asPath}`) && 'opacity-50',
      )}
    >
      <div className="relative">
        <NavItem
          href={categoryHref}
          className={cn('font-bold capitalize tracking-wide', 'flex items-center gap-3')}
          active={docIndexEntry && categoryHref === `/${asPath}`}
        >
          {category.replace(/\-/g, ' ')}
        </NavItem>
      </div>

      <ul>
        {nonIndexItems.map(([page, doc]) => (
          <li key={page}>
            <NavItem href={doc.url} active={doc.url === `/${asPath}`} className="pl-10 text-xs">
              {doc.title}
            </NavItem>
          </li>
        ))}
      </ul>
    </div>
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
        'block cursor-pointer p-3 pl-8',
        active ? 'bg-primary-container' : 'interactive-bg-surface',
        className,
      )}
    >
      {children}
    </Link>
  )
}
