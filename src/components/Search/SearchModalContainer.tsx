import { matchSorter } from 'match-sorter'
import * as React from 'react'

import { useDocs } from '@/app/[...slug]/DocsContext'

import cn from '@/lib/cn'
import { escape } from '@/utils/text'
import { ComponentProps } from 'react'
import type { SearchResult } from './SearchItem'
import SearchItem from './SearchItem'

export const SearchModalContainer = ({ className }: ComponentProps<'search'>) => {
  const { docs } = useDocs()
  const [query, setQuery] = React.useState('')
  const deferredQuery = React.useDeferredValue(query)
  const [results, setResults] = React.useState<SearchResult[]>([])

  React.useEffect(() => {
    React.startTransition(() => {
      if (!deferredQuery) return setResults([])
      // console.log('deferredQuery', deferredQuery)

      // Get length of matched text in result
      const relevanceOf = (result: SearchResult) =>
        (result.title.toLowerCase().match(deferredQuery.toLowerCase())?.length ?? 0) /
        result.title.length

      // Search
      let candidateResults = docs.flatMap(
        ({ tableOfContents }) => tableOfContents,
      ) satisfies SearchResult[]
      // console.log('candidateResults', candidateResults)
      // candidateResults = candidateResults.filter((entry) => entry.description.length > 0)
      // .concat(
      //   Object.entries(boxes).flatMap(([id, data]) => ({
      //     ...data,
      //     label: 'codesandbox.io',
      //     description: data.description ?? '',
      //     content: data.content ?? '',
      //     url: `https://codesandbox.io/s/${id}`,
      //     image: data?.screenshot_url,
      //   }))
      // )

      const results = matchSorter(candidateResults, deferredQuery, {
        keys: ['title', 'description', 'content'],
        threshold: matchSorter.rankings.CONTAINS,
      })
        // Sort by relevance
        .sort((a, b) => relevanceOf(b) - relevanceOf(a))
        // Truncate to top four results
        .slice(0, 4)

      setResults(results)
    })
  }, [docs, deferredQuery])

  return (
    <search className={className}>
      <input
        type="search"
        name="search"
        id="search"
        className={cn(
          'bg-surface-container block w-full px-4 py-6 pl-10 outline-none sm:text-sm',
          results.length > 0 ? 'rounded-t-md' : 'rounded-md',
        )}
        autoComplete="off"
        autoFocus
        placeholder="Search the docs"
        onChange={(e) => setQuery(escape(e.target.value))}
      />

      {results.length > 0 && (
        <ul
          className={cn(
            'list-none',
            'bg-surface-container absolute left-0 flex flex-col gap-1 rounded-b-md p-1',
          )}
        >
          {results.map((result, index) => (
            <li key={`search-item-${index}`}>
              <SearchItem search={query} result={result} />
            </li>
          ))}
        </ul>
      )}
    </search>
  )
}
