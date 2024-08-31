import { Doc } from '@/app/[...slug]/DocsContext'
import * as React from 'react'
import { Foo } from './Foo'

type NavList = Record<string, Record<string, Doc>>

// {
//   'categoryA': {

//   }
// }

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
  console.log('nav', nav)

  return (
    <ul>
      {Object.entries(nav).map(([category, docs]) => {
        return (
          <li key={category}>
            <Foo {...{ category, docs, asPath }} />
          </li>
        )
      })}
    </ul>
  )
}
