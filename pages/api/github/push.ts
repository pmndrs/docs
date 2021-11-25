import { NextApiRequest, NextApiResponse } from 'next'
import { MARKDOWN_REGEX } from 'utils/mdx'
import { getDocs } from 'utils/docs'
import { data } from 'data/libraries'

interface GithubWebhook extends NextApiRequest {
  body: {
    repository: {
      full_name: string
    }
    ref: string
    head_commit: {
      added: string[]
      removed: string[]
      changed: string[]
    }
  }
}

export default async function handler(req: GithubWebhook, res: NextApiResponse) {
  const { repository, ref, head_commit } = req.body

  // Check for repo
  const repo = data.find((lib) => lib.docs.repo === repository.full_name)
  if (!repo) return res.status(400).json({ error: 'Invalid repository' })

  // Check if on docs branch
  if (ref !== `ref/heads/${repo.docs.branch}`) return res.status(304)

  // Check if docs were modified
  const files = [...head_commit.added, head_commit.removed, head_commit.changed]
  const modified = files.filter(
    (file: string) => file.startsWith(repo.docs.dir) && MARKDOWN_REGEX.test(file)
  )
  if (!modified.length) return res.status(304)

  // Update docs
  await getDocs(repo.id, true)

  return res.status(201).json({ message: `${modified.length} docs updated` })
}
