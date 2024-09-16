import backerBadge from '@/assets/backer-badge.svg'
import cn from '@/lib/cn'
import Image from 'next/image'
import { ComponentProps } from 'react'
import { fetchBackers } from './fetchBackers'
import { getInitialName } from './getInitialName'

export async function Backers({
  repo,
  member,
  query = { limit: 1000, offset: 0 },
  className,
  ...props
}: ComponentProps<'div'> & {
  repo: string
  member: 'all' | 'users' | 'organizations'
  query?: { limit?: number; offset?: number }
}) {
  const backers = await fetchBackers(
    `https://opencollective.com/${repo}/members/${member}.json?limit=${query.limit}&offset=${query.offset}`,
  )

  if (!backers) return null

  return (
    <div className={cn('!flex flex-wrap gap-[4px] p-[3px]', className)} {...props}>
      {backers.map((backer) => {
        return (
          <a
            key={backer.MemberId}
            href={backer.profile}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            <div className="bg-note-container-light relative flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-full">
              {backer.image != null ? (
                <Image src={backer.image} alt={backer.name} fill />
              ) : (
                <span className="text-xl font-light text-[#5CA3FF]">
                  {getInitialName(backer.name)}
                </span>
              )}
            </div>
          </a>
        )
      })}
      <a
        href={`https://opencollective.com/${repo}#backers`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image src={backerBadge} alt="Backer" width={96} height={48} />
      </a>
    </div>
  )
}
