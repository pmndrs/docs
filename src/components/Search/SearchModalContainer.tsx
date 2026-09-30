import { matchSorter } from 'match-sorter'
import * as React from 'react'

import { useDocs } from '@/app/[...slug]/DocsContext'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import cn from '@/lib/cn'
import { escape } from '@/utils/text'
import { useRouter } from 'next/navigation'
import { ComponentProps } from 'react'
import type { SearchResult } from './SearchItem'
import SearchItem from './SearchItem'

export const SearchModalContainer = ({
  className,
  close,
}: ComponentProps<'search'> & { close: () => void }) => {
  const router = useRouter()
  const { docs } = useDocs()
  const [query, setQuery] = React.useState('')
  const deferredQuery = React.useDeferredValue(query)
  const [results, setResults] = React.useState<SearchResult[]>([])

  // The highlighted result, held here rather than left to cmdk: results arrive a render after
  // the query (deferred), and cmdk only picks the first item when its own selection is empty, so a
  // selection kept from the previous results would leave the new ones with none, and Enter inert.
  const [selected, setSelected] = React.useState('')
  React.useEffect(() => setSelected(results[0]?.url ?? ''), [results])

  React.useEffect(() => {
    React.startTransition(() => {
      if (!deferredQuery) return setResults([])
      // console.log('deferredQuery', deferredQuery)

      // Get length of matched text in result
      const relevanceOf = (result: SearchResult) =>
        (result.title.toLowerCase().match(escape(deferredQuery.toLowerCase()))?.length ?? 0) /
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
    <search className={cn(className)}>
      {/* The input's wrapper pads all sides but the bottom, leaving it to the list below, which is
       * empty until there is a query: pad the bottom too, so the input sits centred either way. */}
      <Command
        shouldFilter={false}
        value={selected}
        onValueChange={setSelected}
        className="*:data-[slot=command-input-wrapper]:pb-1"
      >
        <CommandInput
          name="search"
          id="search"
          placeholder="Search the docs"
          value={query}
          autoFocus
          onValueChange={(value) => setQuery(value)}
        />

        {/* Tall enough for the four results, short of the viewport: the dialog hangs
         * `--Search-Input-top` from the top, and keeps as much below it. Its scrolled edges fade out,
         * rather than cutting a result's rounded corners square against the input. */}
        <CommandList className="max-h-[calc(100dvh-2*var(--Search-Input-top))] scroll-fade">
          {deferredQuery && <CommandEmpty>No results found.</CommandEmpty>}
          {results.length > 0 && (
            <CommandGroup>
              {results.map((result, index) => {
                return (
                  <CommandItem
                    key={`search-item-${index}`}
                    value={result.url}
                    onSelect={(value) => {
                      router.push(value)
                      close()
                    }}
                    className="p-0 font-normal"
                  >
                    <SearchItem
                      search={query}
                      result={result}
                      tabIndex={-1}
                      className="min-w-0 flex-1"
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </search>
  )
}
