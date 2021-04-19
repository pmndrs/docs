import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react'
import { matchSorter } from 'match-sorter'
import cn from 'classnames'
import { useRouter } from 'next/router'
import Link from 'next/link'

const Item = ({ title, active, href, onMouseOver, search, onClick }) => {
  const highlight = title.toLowerCase().indexOf(search.toLowerCase())

  return (
    <Link href={href}>
      <a className="block no-underline" onMouseOver={onMouseOver} onClick={onClick}>
        <li
          className={cn('p-2 text-gray-800', {
            'bg-gray-100': active,
          })}
        >
          {title.substring(0, highlight)}
          <span className="bg-yellow-300">
            {title.substring(highlight, highlight + search.length)}
          </span>
          {title.substring(highlight + search.length)}
        </li>
      </a>
    </Link>
  )
}

const Search = ({ allDocs }) => {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [search, setSearch] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef(null)

  const results: { title: string; url: string }[] = useMemo(() => {
    if (!search) return []
    // Will need to scrape all the headers from each page and search through them here
    // (similar to what we already do to render the hash links in sidebar)
    // We could also try to search the entire string text from each page
    return matchSorter(allDocs, search, { keys: ['title'] })
  }, [search])

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          if (active + 1 < results.length) {
            setActive(active + 1)
          }
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          if (active - 1 >= 0) {
            setActive(active - 1)
          }
          break
        }
        case 'Enter': {
          router.push(results[active].url)
          setShow(false)
          break
        }
      }
    },
    [active, results, router]
  )

  useEffect(() => {
    setActive(0)
  }, [search])

  useEffect(() => {
    const inputs = ['input', 'select', 'button', 'textarea']

    const down = (e) => {
      if (
        document.activeElement &&
        // @ts-ignore
        inputs.indexOf(document.activeElement.tagName.toLowerCase() !== -1)
      ) {
        if (e.key === '/') {
          e.preventDefault()
          input.current.focus()
        } else if (e.key === 'Escape') {
          setShow(false)
        }
      }
    }

    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [])

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
          id="algolia-search"
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
              />
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Search
