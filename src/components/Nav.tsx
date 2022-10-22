import * as React from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Doc } from 'hooks/useDocs'

interface NavItemProps {
  doc: Doc
}

function NavItem({ doc }: NavItemProps) {
  const { asPath } = useRouter()
  const [active, setActive] = React.useState(false)

  React.useEffect(() => setActive(doc.url === asPath), [doc.url, asPath])

  return (
    <Link href={doc.url ?? '/'}>
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

export interface NavListItem {
  title: string
  url: string
}
export type NavList = Record<string, NavListItem | Record<string, NavListItem>>

export interface NavProps {
  nav: NavList
}

function Nav(props: NavProps) {
  return (
    <ul>
      {Object.entries(props.nav).map(([key, doc]) => (
        <li key={key}>
          <h3 className="px-6 mt-8 mb-2 text-sm lg:text-xs text-gray-900 uppercase tracking-wide font-semibold">
            {key.replace(/\-/g, ' ')}
          </h3>
          {doc.url ? (
            <NavItem key={key} doc={doc as Doc} />
          ) : (
            Object.entries(doc).map(([key, doc]: [string, Doc]) => <NavItem key={key} doc={doc} />)
          )}
        </li>
      ))}
    </ul>
  )
}

export default Nav
