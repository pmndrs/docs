import { useMemo } from 'react'
import { matchSorter } from 'match-sorter'
export type Result = { title: string; url: string; content: string }

const threeD = ['react-three-fiber', 'drei']

export default function useSearch({ search, folder, allDocs }): [Result[], boolean] {
  const isThreeD = threeD.includes(folder)
  const results = useMemo(() => {
    if (!search) return []
    if (isThreeD) {
      const results: Result[] = matchSorter(
        allDocs.filter((doc) => threeD.includes(doc.url.split('/')[1])),
        search,
        { keys: ['title', 'description', 'content'], threshold: matchSorter.rankings.CONTAINS }
      )
      return results
        .sort((a: Result, b: Result) => {
          const highlightedMore = (a: Result) => a.title.toLowerCase().indexOf(search.toLowerCase())
          return highlightedMore(b) - highlightedMore(a)
        })
        .slice(0, 10)
    } else {
      const re: Result[] = matchSorter(
        allDocs.filter((doc: Result) => doc.url.includes(`/${folder}/`)),
        search,
        { keys: ['title', 'description', 'content'], threshold: matchSorter.rankings.CONTAINS }
      )
      return re.slice(0, 10)
    }
  }, [search])

  return [results, isThreeD]
}
