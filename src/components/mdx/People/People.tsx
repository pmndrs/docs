import cn from '@/lib/cn'
import { initials } from '@/utils/text'
import Image from 'next/image'
import { cache, ComponentProps } from 'react'
import backerBadge from './backer-badge.svg'

//  ██████  ██████  ███    ██ ████████ ██████  ██ ██████  ██    ██ ████████  ██████  ██████  ███████
// ██      ██    ██ ████   ██    ██    ██   ██ ██ ██   ██ ██    ██    ██    ██    ██ ██   ██ ██
// ██      ██    ██ ██ ██  ██    ██    ██████  ██ ██████  ██    ██    ██    ██    ██ ██████  ███████
// ██      ██    ██ ██  ██ ██    ██    ██   ██ ██ ██   ██ ██    ██    ██    ██    ██ ██   ██      ██
//  ██████  ██████  ██   ████    ██    ██   ██ ██ ██████   ██████     ██     ██████  ██   ██ ███████

export async function Contributors({
  owner,
  repo,
  limit = 50,
  className,
  ...props
}: { owner: string; repo: string; limit: number } & ComponentProps<'ul'>) {
  const contributors = (
    await cachedFetchContributors(owner, repo).catch(
      (err) =>
        Array.from({ length: 100 }).map(() => ({
          login: 'jdoe',
          html_url: 'https://github.com/jdoe',
          avatar_url: '',
        })) as Awaited<ReturnType<typeof cachedFetchContributors>>,
    )
  ).slice(0, limit)

  return (
    <div>
      <ul className={cn('flex flex-wrap gap-1', className)} {...props}>
        {contributors.map(({ html_url, avatar_url, login }) => (
          <li key={login}>
            <Avatar profileUrl={html_url} imageUrl={avatar_url || ''} name={login} />
          </li>
        ))}
      </ul>
    </div>
  )
}

type Contributor = {
  login: string
  html_url: string
  avatar_url?: string
}

async function fetchContributors(owner: string, repo: string): Promise<Contributor[]> {
  try {
    const headers: Record<string, string> = {
      'X-GitHub-Api-Version': '2022-11-28',
    }
    if (process.env.CONTRIBUTORS_PAT) {
      headers['Authorization'] = `Bearer ${process.env.CONTRIBUTORS_PAT}`
    }
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/collaborators`, {
      headers,
    })
    if (!res.ok) {
      throw new Error(`GitHub API returned ${res.status}`)
    }
    return await res.json()
  } catch (error) {
    // Fallback when GitHub API is not accessible or auth fails
    console.warn('Failed to fetch GitHub contributors, using fallback', error)
    return Array.from({ length: 50 }).map((_, i) => ({
      login: `contributor${i}`,
      html_url: 'https://github.com',
      avatar_url: '',
    }))
  }
}
const cachedFetchContributors = cache(fetchContributors)

// ██████   █████   ██████ ██   ██ ███████ ██████  ███████
// ██   ██ ██   ██ ██      ██  ██  ██      ██   ██ ██
// ██████  ███████ ██      █████   █████   ██████  ███████
// ██   ██ ██   ██ ██      ██  ██  ██      ██   ██      ██
// ██████  ██   ██  ██████ ██   ██ ███████ ██   ██ ███████

export async function Backers({
  repo,
  limit = 50,
  className,
  ...props
}: ComponentProps<'ul'> & {
  repo: string
  limit: number
}) {
  const backers = (await cachedFetchBackers(repo)).slice(0, limit)

  return (
    <div>
      <ul className={cn('flex flex-wrap gap-1', className)} {...props}>
        {backers.map((backer) => (
          <li key={backer.name}>
            <Avatar profileUrl={backer.profile} imageUrl={backer.image} name={backer.name} />
          </li>
        ))}
      </ul>
      <p>
        <a
          href={`https://opencollective.com/${repo}#backers`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src={backerBadge} alt="Backer" />
        </a>
      </p>
    </div>
  )
}

async function fetchBackers(repo: string) {
  try {
    const res = await fetch(`https://opencollective.com/${repo}/members/users.json`)
    const backers: {
      profile: string
      name: string
      image: string
      totalAmountDonated: number
    }[] = await res.json()

    const backersMap = new Map(backers.map((backer) => [backer.name, backer]))
    backersMap.forEach((backer) => {
      const existingBacker = backersMap.get(backer.name)
      if (existingBacker && backer.totalAmountDonated >= existingBacker.totalAmountDonated) {
        backersMap.set(backer.name, backer) // replace with the backer with the highest donation
      }
    })
    const uniqueBackers = Array.from(backersMap.values())

    return uniqueBackers.sort((a, b) => b.totalAmountDonated - a.totalAmountDonated)
  } catch (error) {
    // Fallback when OpenCollective API is not accessible
    console.warn('Failed to fetch OpenCollective backers, using empty array', error)
    return []
  }
}

const cachedFetchBackers = cache(fetchBackers)

//
// common
//

function Avatar({
  profileUrl,
  imageUrl,
  name,
  className,
  ...props
}: { profileUrl: string; imageUrl: string; name: string } & ComponentProps<'a'>) {
  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        className,
        'bg-surface-container-high inline-flex size-12 items-center justify-center overflow-clip rounded-full',
      )}
      {...props}
    >
      {imageUrl ? (
        <Image width="48" height="48" src={imageUrl} alt={name} className="size-full" />
      ) : (
        initials(name)
      )}
    </a>
  )
}
