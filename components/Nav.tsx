import * as React from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Doc, useDocs } from 'hooks/useDocs'

function NavItem({ doc, active, ...props }) {
  return (
    <Link {...props} href={doc.url ?? '/'}>
      <a
        className={clsx(
          'rounded-md block px-6 py-2 text-gray-800 font-normal hover:bg-gray-50 cursor-pointer',
          active && 'bg-gray-100'
        )}
      >
        {doc.title}
      </a>
    </Link>
  )
}

function Nav() {
  const { asPath } = useRouter()
  const docs = useDocs()
  const nav = React.useMemo(
    () =>
      docs.reduce((acc, doc) => {
        const [lib, ...rest] = doc.slug
        const [page, category] = rest.reverse()

        if (category && !acc[category]) acc[category] = {}

        if (category) acc[category][page] = doc
        else acc[page] = doc

        return acc
      }, {}),
    [docs]
  )

  return (
    <ul>
      {Object.entries(nav).map(([key, doc]) => (
        <li key={key}>
          <h3 className="px-6 mt-8 mb-2 text-sm lg:text-xs text-gray-900 uppercase tracking-wide font-semibold">
            {key.replace(/\-/g, ' ')}
          </h3>
          {(doc as Doc).url ? (
            <NavItem key={key} active={(doc as Doc).url === asPath} doc={doc} />
          ) : (
            Object.entries(doc).map(([key, doc]) => (
              <NavItem key={key} active={doc.url === asPath} doc={doc} />
            ))
          )}
        </li>
      ))}
    </ul>
  )
}

export default Nav
