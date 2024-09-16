import { cache } from 'react'

type Contributor = {
  id: number
  login: string
  avatar_url: string
  html_url: string
}

async function _fetchContributors(repo: string): Promise<Contributor[]> {
  return new Promise((resolve) => {
    resolve(
      Array.from({ length: 50 }, (_, i) => ({
        login: `pmndrs-${i}`,
        id: i,
        avatar_url: 'https://avatars.githubusercontent.com/u/45790596?s=200&v=4',
        html_url: 'https://github.com/pmndrs',
      })),
    )
  })
  //   const res = await fetch(`https://api.github.com/repos/pmndrs/${repo}/collaborators`, {
  //     headers: {
  //       Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  //       'Content-Type': 'application/vnd.github+json',
  //     },
  //     next: { revalidate: 3600 },
  //   })
  //   if (!res.ok) throw new Error('Failed to fetch contributors')
  //   return res.json()
}

export const fetchContributors = cache(_fetchContributors)
