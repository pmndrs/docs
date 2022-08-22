import type { NextApiRequest, NextApiResponse } from 'next'
import { getDocs } from 'utils/docs'
import { fs } from 'memfs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const lib = req.query.lib as string
  const url = req.query.url as string

  await getDocs(lib as string)

  return res.status(200).end(fs.readFileSync(url))
}
