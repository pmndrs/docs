import * as React from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { Doc } from '@/app/[...slug]/DocsContext'

interface NavItemProps {
  doc: Doc
  asPath: string
}

function NavItem({ doc, asPath }: NavItemProps) {
  const active = doc.url === `/${asPath}`

  return (
    <Link
      href={doc.url ?? '/'}
      className={clsx(
        'mb-1 block cursor-pointer rounded-md px-6 py-2 font-normal text-gray-800 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700',
        active && 'bg-gray-100 dark:bg-gray-700',
      )}
    >
      {doc.title}
    </Link>
  )
}

type NavList = Record<string, Doc | Record<string, Doc>>

function Nav({ docs, asPath }: { docs: Doc[]; asPath: string }) {
  const nav = React.useMemo(
    () =>
      docs.reduce((acc, doc) => {
        const [...rest] = doc.slug
        const [page, category] = rest.reverse()

        if (category && !acc[category]) acc[category] = {}

        // @ts-ignore
        if (category) acc[category][page] = doc
        else acc[page] = doc

        return acc
      }, {} as NavList),
    [docs],
  )

  return (
    <ul>
      {Object.entries(nav).map(([key, doc]) => (
        <li key={key}>
          <h3 className="mb-2 mt-8 px-6 text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300 lg:text-xs">
            {key.replace(/\-/g, ' ')}
          </h3>
          {doc.url ? (
            <NavItem key={key} doc={doc as Doc} asPath={asPath} />
          ) : (
            Object.entries(doc).map(([key, doc]: [string, Doc]) => (
              <NavItem key={key} doc={doc} asPath={asPath} />
            ))
          )}
        </li>
      ))}
    </ul>
  )
}

export default Nav
