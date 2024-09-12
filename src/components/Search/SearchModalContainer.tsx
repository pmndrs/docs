import { matchSorter } from 'match-sorter'
import * as React from 'react'

import { useDocs } from '@/app/[...slug]/DocsContext'

import { Command } from 'cmdk'
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
      <Command shouldFilter={false}>
        <Command.Input
          name="search"
          id="search"
          className="bg-surface-container block w-full rounded-md px-4 py-6 pl-10 sm:text-sm"
          placeholder="Search the docs"
          value={query}
          autoFocus
          onValueChange={(value) => setQuery(value)}
        />

        <Command.List>
          {results.length > 0 && (
            <div className="bg-surface-container mt-1 flex flex-col gap-1 rounded-md p-1">
              {results.map((result, index) => {
                return (
                  <Command.Item key={`search-item-${index}`}>
                    <SearchItem search={query} result={result} />
                  </Command.Item>
                )
              })}
            </div>
          )}
        </Command.List>
      </Command>
    </search>
  )
}
