import { useMemo, Fragment } from 'react'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import Link from 'next/link'
import useDocs from 'hooks/useDocs'

function Nav() {
  const { asPath } = useRouter()
  const { docs } = useDocs()
  const nav = useMemo(
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
      {Object.entries(nav).map(([key, children]) => (
        <Fragment key={key}>
          <h3 className="px-6 mt-8 mb-2 text-sm lg:text-xs text-gray-900 uppercase tracking-wide font-semibold">
            {key.replace(/\-/g, ' ')}
          </h3>
          {Object.entries(children).map(([key, doc]) => (
            <li key={key}>
              <Link href={doc.url}>
                <a
                  className={clsx(
                    'rounded-md block px-6 py-2 text-gray-800 font-normal hover:bg-gray-50 cursor-pointer',
                    doc.url === asPath && 'bg-gray-100'
                  )}
                >
                  {doc.title}
                </a>
              </Link>
            </li>
          ))}
        </Fragment>
      ))}
    </ul>
  )
}

export default Nav
