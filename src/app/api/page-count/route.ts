// Recounts the home page's pages now rather than at the end of the hour: what its refresh
// button posts to. Server only, like the rest of `src/app/api`, which the static export leaves
// out -- and the button with it.

import { PAGE_COUNT_TAG } from '@/app/page.count'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * A recount asked for within this of the previous one is not done: the endpoint is public, and
 * each recount fetches every library's dump again.
 *
 * Per server instance, kept in memory: it bounds what one instance sends upstream, not what a
 * fleet of them does.
 */
const MIN_INTERVAL_MS = 60_000

let lastRecountAt = -Infinity

/**
 * Throws the cached dumps and the home page away, so the next visit to it counts again --
 * unless a recount was asked for less than a minute ago, which is answered 429.
 */
export function POST() {
  const now = Date.now()
  const wait = lastRecountAt + MIN_INTERVAL_MS - now
  if (wait > 0) {
    return Response.json(
      { recounted: false },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(wait / 1000)) } },
    )
  }
  lastRecountAt = now

  // `expire: 0`, not the recommended 'max': stale-while-revalidate would serve the visit right
  // after this the old count once more. `updateTag` would be the one to use, but it is for
  // Server Actions only, and a static export has none to build.
  revalidateTag(PAGE_COUNT_TAG, { expire: 0 })
  // The page holds the count rendered: it goes too, not only the fetches it was made from.
  revalidatePath('/')

  return Response.json({ recounted: true })
}
