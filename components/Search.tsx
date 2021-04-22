import React, { useRef, useState } from 'react'

import cn from 'classnames'
import { useRouter } from 'next/router'
import Link from 'next/link'
import titleCase from 'utils/titleCase'
import useSearch, { Result } from 'hooks/useSearch'
import useKeyboardSearch from 'hooks/useKeyboardSearch'

const Item = ({ title, active, href, onMouseOver, search, onClick, multipleLibs }) => {
  const highlight = title.toLowerCase().indexOf(search.toLowerCase())
  const name = titleCase(href.split('/')[1].split('-').join(' '))
  return (
    <Link href={href}>
      <a className="block no-underline" onMouseOver={onMouseOver} onClick={onClick}>
        <li
          className={cn('p-2 text-gray-800', {
            'bg-gray-100': active,
          })}
        >
          {multipleLibs ? name : null} -
          {highlight !== -1 ? (
            <>
              {title.substring(0, highlight)}
              <span className="bg-yellow-300">
                {title.substring(highlight, highlight + search.length)}
              </span>
              {title.substring(highlight + search.length)}
            </>
          ) : (
            title
          )}
        </li>
      </a>
    </Link>
  )
}

const Search = ({ allDocs }) => {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const input = useRef(null)
  const folder = router.query.slug[0]
  const [results, isThreeD]: [Result[], boolean] = useSearch({ search, folder, allDocs })
  const [handleKeyDown, show, setShow, active, setActive] = useKeyboardSearch({
    search,
    results,
    input,
  })
  const renderList = show && results.length > 0

  return (
    <div className="relative w-full">
      {renderList && <div className="search-overlay z-1" onClick={() => setShow(false)} />}
      <div className="flex items-center justify-between flex-auto h-16 px-4 border-b border-gray-200">
        <input
          onChange={(e) => {
            setSearch(e.target.value)
            setShow(true)
          }}
          className="appearance-none w-full h-full p-4"
          type="search"
          placeholder='Quick search ("/" to focus)'
          onKeyDown={handleKeyDown}
          onFocus={() => setShow(true)}
          ref={input}
        />{' '}
      </div>
      {renderList && (
        <ul
          className="shadow-md list-none p-0 m-0 absolute left-0 bg-white rounded mt-1 border top-100 divide-y divide-gray-300 z-2"
          style={{ left: '5%', width: '90%' }}
        >
          {results.map((res, i) => {
            return (
              <Item
                key={`search-item-${i}`}
                title={res.title}
                href={res.url}
                active={i === active}
                search={search}
                onClick={() => setShow(false)}
                onMouseOver={() => setActive(i)}
                multipleLibs={isThreeD}
              />
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Search
