import type { NextApiRequest, NextApiResponse } from 'next'
import { getDocs } from 'utils/docs'
import { fetchCSB } from 'hooks/useCSB'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const docs = await getDocs()
  const ids = docs.flatMap((doc) => doc.boxes)

  const boxes = await fetchCSB(ids)

  return res.status(200).json(boxes)
}
