import { Doc } from '@/app/[...slug]/DocsContext'
import cn from '@/lib/cn'
import * as React from 'react'
import { NavCategory } from './NavCategory'
import { NavCategoryCollapsible } from './NavCategoryCollapsible'

type NavList = Record<string, Record<string, Doc>>

export function Nav({
  className,
  docs,
  asPath,
  collapsible = true,
}: React.ComponentProps<'ul'> & {
  docs: Doc[]
  asPath: string
  collapsible: boolean
}) {
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
    <ul className={cn(className, '')}>
      {Object.entries(nav).map(([category, docs]) => {
        return (
          <li key={category}>
            {collapsible ? (
              <NavCategoryCollapsible {...{ category, docs, asPath }} />
            ) : (
              <NavCategory {...{ category, docs, asPath }} />
            )}
          </li>
        )
      })}
    </ul>
  )
}
