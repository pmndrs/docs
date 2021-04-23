import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment } from 'react'

type NavRoute = {
  url: string
  title: string
}

type NavProps = {
  nav: Record<string, Record<string, NavRoute>>
}

function NavItem({ route }) {
  const { asPath } = useRouter()
  const isActive = route.url === asPath

  return (
    <li>
      <Link href={route.url.replace('index', '')}>
        <a
          className={clsx(
            'rounded-md block px-6 py-2 text-gray-800 font-normal hover:bg-gray-50 cursor-pointer',
            isActive && 'bg-gray-100'
          )}
        >
          {route.title}
        </a>
      </Link>
    </li>
  )
}

function Nav({ nav }: NavProps) {
  return (
    <ul>
      {Object.entries(nav).map(([key, children], index) => (
        <Fragment key={`${key}-${index}`}>
          <h3 className="px-6 mt-8 mb-2 text-sm lg:text-xs text-gray-900 uppercase tracking-wide font-semibold">
            {key.split('-').join(' ')}
          </h3>
          {Object.entries(children).map(([key, route], index) => (
            <Fragment key={`${key}-${index}`}>
              <NavItem route={route} />
            </Fragment>
          ))}
        </Fragment>
      ))}
    </ul>
  )
}

export default Nav
