import type { NextApiRequest, NextApiResponse } from 'next'

export interface ICodesandbox {
  title: string
  description: string
  alias: string
  screenshot_url: string
  tags: string[]
  modules: { directory_shortid: string; title: string; code: string }[]
  directories: { shortid: string; title: string }[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req
  const { id } = query

  const { data }: { data?: ICodesandbox } = await fetch(
    `https://codesandbox.io/api/v1/sandboxes/${id}`
  ).then((rsp) => rsp.json())

  return res.status(200).json(data)
}
