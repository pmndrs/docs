import { Octokit } from '@octokit/core'

const octokit = new Octokit({
  auth: process.env.CONTRIBUTORS_PAT,
})

/**
 * Reads the owner and repo out of a GitHub repository URL, like `https://github.com/pmndrs/drei`.
 */
export function parseGitHubRepo(url: string) {
  const match = url.match(/^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/#?]+)/)
  if (!match) return undefined

  const [, owner, repo] = match
  return { owner, repo: repo.replace(/\.git$/, '') }
}

/**
 * Shortens a star count the way GitHub-ish headers do: `950`, `2.1k`, `30k`, `125k`.
 */
export function formatStars(stars: number) {
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(stars).toLowerCase()
}

async function fetchStars(url: string) {
  const repo = parseGitHubRepo(url)
  if (!repo) return undefined

  try {
    const res = await octokit.request('GET /repos/{owner}/{repo}', {
      ...repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    return res.data.stargazers_count
  } catch {
    // Rate-limited or offline: the header shows the GitHub link without a count
    return undefined
  }
}

// Every page of a static build renders the header, so the count is fetched once per process
// rather than once per page, which would burn through the API rate limit.
const starsByUrl = new Map<string, Promise<number | undefined>>()

export function getStars(url: string) {
  let stars = starsByUrl.get(url)
  if (!stars) {
    stars = fetchStars(url)
    starsByUrl.set(url, stars)
  }
  return stars
}
