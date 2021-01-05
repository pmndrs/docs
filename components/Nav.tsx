import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'

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
      <Link href={`${route.url.replace('index', '')}`}>
        <a
          className={clsx(
            'block px-6 py-3 text-gray-800 capitalize font-normal hover:bg-gray-100 cursor-pointer',
            isActive && 'bg-gray-200'
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
      {Object.entries(nav).map(([key, children]) => (
        <>
          <h3 className="px-6 mt-8 mb-2 text-lg text-gray-900 capitalize">
            {key.split('-').join(' ')}
          </h3>
          {Object.entries(children).map(([key, route]) => (
            <NavItem route={route} />
          ))}
        </>
      ))}
    </ul>
  )
}

export default Nav
