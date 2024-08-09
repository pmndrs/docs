import * as React from 'react'
import { useRouter } from 'next/navigation'
import { matchSorter } from 'match-sorter'

import { useDocs } from '@/app/[[...slug]]/DocsContext'

import SearchModal from './SearchModal'
import type { SearchResult } from './SearchItem'
import { escape } from '@/utils/text'

export interface SearchModalContainerProps {
  onClose: React.MouseEventHandler<HTMLButtonElement>
}

export const SearchModalContainer = ({ onClose }: SearchModalContainerProps) => {
  // const router = useRouter()
  // const boxes = useCSB()
  const { docs } = useDocs()
  console.log('docs', docs)
  // const [lib] = router.query.slug as string[]
  const [query, setQuery] = React.useState('')
  const deferredQuery = React.useDeferredValue(query)
  const [results, setResults] = React.useState<SearchResult[]>([])

  React.useEffect(() => {
    React.startTransition(() => {
      if (!deferredQuery) return setResults([])

      // Get length of matched text in result
      const relevanceOf = (result: SearchResult) =>
        (result.title.toLowerCase().match(deferredQuery.toLowerCase())?.length ?? 0) /
        result.title.length

      // Search
      const entries = (
        docs.flatMap(({ tableOfContents }) => tableOfContents) as SearchResult[]
      ).filter((entry) => entry.description.length > 0)
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

      const results = matchSorter(entries, deferredQuery, {
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
    <SearchModal
      search={query}
      results={results}
      onClose={onClose}
      onChange={(e) => setQuery(escape(e.target.value))}
    />
  )
}
