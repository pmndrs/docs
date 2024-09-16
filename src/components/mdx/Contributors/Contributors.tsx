import cn from '@/lib/cn'
import Image from 'next/image'
import { fetchContributors } from './fetchContributors'

export async function Contributors({
  repo,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  repo: string
}) {
  const contributors = await fetchContributors(repo)

  if (!contributors) return null

  return (
    <div className={cn('!flex flex-wrap gap-[4px] p-[3px]', className)} {...props}>
      {contributors.map((contributor) => (
        <a
          key={contributor.id}
          href={contributor.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center"
        >
          <div className="relative flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-full">
            <Image src={contributor.avatar_url} alt={contributor.login} fill />
          </div>
        </a>
      ))}
    </div>
  )
}
