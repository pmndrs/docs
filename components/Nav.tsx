import Link from 'next/link'

type NavProps = {
  nav: Record<
    string,
    Record<
      string,
      {
        url: string
        title: string
      }
    >
  >
}

function Nav({ nav }: NavProps) {
  return (
    <ul>
      {Object.entries(nav).map(([key, children]) => (
        <>
          <h3 className="mt-8 mb-2 text-xs text-gray-900 uppercase">{key.split('-').join(' ')}</h3>
          {Object.entries(children).map(([key, route]) => (
            <li className="mb-3 text-gray-500">
              <Link href={`${route.url.replace('index', '')}`}>
                <a>{route.title}</a>
              </Link>
            </li>
          ))}
        </>
      ))}
    </ul>
  )
}

export default Nav
