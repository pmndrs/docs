import { Doc } from '@/app/[...slug]/DocsContext'
import * as React from 'react'
import { NavCategory } from './NavCategory'

type NavList = Record<string, Record<string, Doc>>

export function Nav({ docs, asPath }: { docs: Doc[]; asPath: string }) {
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

  return (
    <ul className="mt-8">
      {Object.entries(nav).map(([category, docs]) => {
        return (
          <li key={category}>
            <NavCategory {...{ category, docs, asPath }} />
          </li>
        )
      })}
    </ul>
  )
}
