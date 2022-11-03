import crypto from 'crypto'
import { fetch } from 'undici'
import type { NextApiRequest, NextApiResponse } from 'next'
import libs from 'data/libraries'

interface GithubWebhook extends NextApiRequest {
  headers: {
    'x-hub-signature': string
  }
  body: {
    repository: {
      full_name: string
    }
    ref: string
    head_commit: {
      added: string[]
      removed: string[]
      modified: string[]
    }
  }
}

export default async function handler(req: GithubWebhook, res: NextApiResponse) {
  const { repository, ref, head_commit } = req.body

  try {
    // Get source signature
    const source = Buffer.from(req.headers['x-hub-signature'])

    // Create comparison signature
    const hmac = crypto.createHmac('sha1', process.env.VERCEL_DEPLOY_SECRET!)
    const signature = hmac.update(JSON.stringify(req.body)).digest('hex')
    const comparison = Buffer.from(`sha1=${signature}`)

    // Check authenticity of signature
    const authentic = crypto.timingSafeEqual(source, comparison)
    if (!authentic) return res.status(401).json({ error: 'Invalid authentication' })

    // Check for repo
    const lib = Object.keys(libs).find((key) => libs[key]?.docs?.startsWith(repository.full_name))
    if (!lib) return res.status(400).json({ error: 'Invalid repository' })

    // Check if on docs branch
    const config = libs[lib]
    const [_user, _repo, branch, ...rest] = config.docs!.split('/')
    if (ref !== `refs/heads/${branch || 'main'}`) return res.status(304)

    // Check if docs were modified
    const dir = rest.join('/')
    const files = [...head_commit.added, ...head_commit.removed, ...head_commit.modified]
    const changes = files.filter((file: string) => /\.mdx?$/.test(file) && file.startsWith(dir))
    if (!changes.length) return res.status(304)

    // Update docs
    await fetch(process.env.VERCEL_DEPLOY_WEBHOOK!, { method: 'POST' })

    return res.status(201).json({ message: `${changes.length} docs updated` })
  } catch (error) {
    console.error(req, error)
    return res.status(500).json({ message: 'Update rejected' })
  }
}
