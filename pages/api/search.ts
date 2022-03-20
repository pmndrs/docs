import { matchSorter } from 'match-sorter'
import { getDocs } from 'utils/docs'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Doc } from 'utils/docs'
import type libs from 'data/libraries'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { lib, query } = req.body

  // Fetch libs' docs
  const docs = await getDocs(lib as keyof typeof libs)

  // Get length of matched text in result
  const relevanceOf = (result: Doc) =>
    result.title.toLowerCase().indexOf((query as string).toLowerCase())

  // Search
  const results = matchSorter(docs, query as string, {
    keys: ['title', 'description', 'content'],
    threshold: matchSorter.rankings.CONTAINS,
  })
    // Sort by relevance
    .sort((a: Doc, b: Doc) => relevanceOf(b) - relevanceOf(a))
    // Truncate to top four results
    .slice(0, 4) as unknown as Doc[]

  return res.status(200).json(results)
}
