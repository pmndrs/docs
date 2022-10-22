import type { NextApiRequest, NextApiResponse } from 'next'
import { getDocs } from 'utils/docs'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const docs = await getDocs()
  return res.status(200).json(docs)
}
