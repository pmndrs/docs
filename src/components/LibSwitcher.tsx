import * as React from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Popover } from '@headlessui/react'
import libs from 'data/libraries'

export default function LibSwitcher() {
  const router = useRouter()
  const { query } = router
  const currentPage = React.useMemo(() => libs[query.slug![0]].title, [query])

  return (
    <Popover className="relative mt-4">
      <Popover.Button className="block w-full px-6 py-2 focus:outline-none bg-black rounded-md font-bold text-lg text-white dark:bg-white dark:text-gray-900">
        {currentPage}
      </Popover.Button>
      <Popover.Panel className="absolute z-10 w-full mt-4 p-3 shadow-2xl bg-white dark:bg-gray-800 rounded-md">
        <div className="flex flex-col space-y-3">
          {Object.entries(libs).map(([id, data]) => (
            <Link
              key={id}
              href={data.url}
              className={clsx(
                'px-3 py-2 hover:bg-gray-50 rounded-md font-normal text-base dark:hover:bg-gray-600/30',
                id === query.slug![0] && 'sr-only'
              )}
            >
              {data.title}
            </Link>
          ))}
        </div>
      </Popover.Panel>
    </Popover>
  )
}
