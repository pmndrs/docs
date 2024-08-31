import { Doc } from '@/app/[...slug]/DocsContext'
import cn from '@/lib/cn'
import Link from 'next/link'
import * as React from 'react'
import { ComponentProps } from 'react'

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
        'mb-1 block cursor-pointer rounded-md px-6 py-2',
        active ? 'interactive-bg-primary-container' : 'interactive-bg-surface',
        className,
      )}
    >
      {children}
    </Link>
  )
}

type NavList = Record<string, Record<string, Doc>>

// {
//   'categoryA': {

//   }
// }

const INDEX_PAGE = 'index'

function Nav({ docs, asPath }: { docs: Doc[]; asPath: string }) {
  const nav = React.useMemo(
    () =>
      docs.reduce((acc, doc) => {
        const page = doc.slug.at(-1)
        const category = doc.slug.at(-2) || 'root'

        acc[category] ??= {}
        if (page) acc[category][page] = doc

        return acc
      }, {} as NavList),
    [docs],
  )
  console.log('nav', nav)

  return (
    <ul>
      {Object.entries(nav).map(([category, docs]) => {
        const docsEntries = Object.entries(docs)
        const indexEntry = docsEntries.find(([page]) => page === INDEX_PAGE)
        const foo = indexEntry ? indexEntry[1].url : '#'
        return (
          <li key={category}>
            <NavItem
              href={foo}
              // className="mb-2 mt-8 px-6 text-sm font-bold uppercase tracking-wide text-on-surface-variant/50 lg:text-xs"
              className="mb-2 mt-8 text-sm font-bold uppercase tracking-wide text-on-surface-variant/50 lg:text-xs"
              active={foo === `/${asPath}`}
            >
              {category}
            </NavItem>

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
          </li>
        )
      })}
    </ul>
  )
}

export default Nav
