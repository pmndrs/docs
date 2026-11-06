'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import { RotateCwIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import type { PageCount } from './page.count'
import { refreshTimes } from './page.count.time'

/** The clock the server words the times on, before the browser words them on the viewer's. */
const SERVER_CLOCK = { locale: 'en-GB', timeZone: 'UTC' }

type PageCountLineProps = {
  count: PageCount
  /** Where the refresh button posts to; no button without it, as in a static export. */
  refreshUrl?: string
}

/**
 * The home page's "so many pages across so many libraries", with each library's share on hover
 * or focus, when it was counted, and a button to count again now.
 */
export function PageCountLine({ count, refreshUrl }: PageCountLineProps) {
  const isHydrated = useIsHydrated()
  const router = useRouter()
  const [isRecounting, startRecount] = useTransition()

  const countedAt = new Date(count.countedAt)
  // The server's render is when the count was made, and the hydration has to match it: the
  // viewer's own time and "now" only once hydrated.
  const { updated, next } = isHydrated
    ? refreshTimes(countedAt, new Date())
    : refreshTimes(countedAt, countedAt, SERVER_CLOCK)
  const zone = isHydrated ? '' : ' UTC'

  const breakdown = count.libs.map((lib) => `${lib.title} ${lib.pages || 'unavailable'}`)

  function recount(url: string) {
    startRecount(async () => {
      // A 429 -- a recount less than a minute ago -- still refreshes: to that one's count
      await fetch(url, { method: 'POST' }).catch(() => undefined)
      startRecount(() => router.refresh())
    })
  }

  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-1.5 text-sm text-muted-foreground lg:justify-start">
      <Tooltip>
        <TooltipTrigger
          aria-label={`${count.pages} pages across ${count.libraries} libraries: ${breakdown.join(', ')}`}
          className="cursor-default rounded-sm underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          {count.pages} pages across {count.libraries} libraries
        </TooltipTrigger>
        <TooltipContent>
          <dl className="grid grid-cols-[1fr_auto] gap-x-4">
            {count.libs.map((lib) => (
              <div key={lib.name} className="contents">
                <dt>{lib.title}</dt>
                <dd className="text-right tabular-nums">{lib.pages || 'unavailable'}</dd>
              </div>
            ))}
          </dl>
        </TooltipContent>
      </Tooltip>
      {refreshUrl && (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Recount the pages now"
          title="Recount the pages now"
          disabled={isRecounting}
          onClick={() => recount(refreshUrl)}
        >
          <RotateCwIcon className={isRecounting ? 'animate-spin' : undefined} />
        </Button>
      )}
      <span>
        · updated <time dateTime={count.countedAt}>{`${updated}${zone}`}</time> ·{' '}
        {next ? `next refresh after ${next}${zone}` : 'refresh due, reload to see it'}
      </span>
    </div>
  )
}
