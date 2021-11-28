import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import cx from 'clsx'
import { Popover } from '@headlessui/react'

import { data } from '../data/libraries'

export default function LibSwitcher() {
  const router = useRouter()
  const { query } = router
  const currentPage = useMemo(() => data.find((item) => item.id === query.slug[0]).title, [query])

  return (
    <Popover className="relative mt-4">
      <Popover.Button className="block w-full px-6 py-2 focus:outline-none bg-black rounded-md font-bold text-lg text-white">
        {currentPage}
      </Popover.Button>
      <Popover.Panel className="absolute z-10 w-full mt-4 p-3 shadow-2xl bg-white rounded-md">
        <div className="flex flex-col space-y-3">
          {data.map((item) => (
            <Link key={item.id} href={`/${item.id}`}>
              <a
                className={cx(
                  'px-3 py-2 hover:bg-gray-50 rounded-md font-normal text-base',
                  item.id === query.slug[0] && 'sr-only'
                )}
              >
                {item.title}
              </a>
            </Link>
          ))}
        </div>
      </Popover.Panel>
    </Popover>
  )
}
