import { Button } from '@/components/ui/button'
import cn from '@/lib/cn'
import { HeartIcon } from 'lucide-react'
import { ComponentProps } from 'react'

const SPONSORS_URL = 'https://github.com/sponsors/pmndrs'

/**
 * A call to sponsor Poimandres on GitHub, under the table of contents, like the "Deploy on Vercel"
 * card of the shadcn/ui docs. Static: every site this engine builds is a pmndrs library, so the
 * link is the same for all of them.
 */
export function SponsorCard({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg bg-surface-container p-6 text-sm text-on-surface-variant',
        className,
      )}
      {...props}
    >
      <p className="text-base font-semibold text-on-surface">Sponsor Poimandres</p>
      <p>Poimandres is an open source developer collective.</p>
      <p>
        Your sponsorship keeps react-three-fiber, drei, zustand and friends free and maintained.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-2 self-start"
        nativeButton={false}
        render={<a href={SPONSORS_URL} target="_blank" rel="noopener noreferrer" />}
      >
        <HeartIcon data-icon="inline-start" />
        Sponsor on GitHub
      </Button>
    </div>
  )
}
