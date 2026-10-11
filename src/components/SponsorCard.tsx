import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
    <Card size="sm" className={className} {...props}>
      <CardHeader>
        <CardTitle>Sponsor Poimandres</CardTitle>
        <CardDescription className="flex flex-col gap-2">
          <p>Poimandres is an open source developer collective.</p>
          <p>
            Your sponsorship keeps react-three-fiber, drei, zustand and friends free and maintained.
          </p>
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<a href={SPONSORS_URL} target="_blank" rel="noopener noreferrer" />}
        >
          <HeartIcon data-icon="inline-start" />
          Sponsor on GitHub
        </Button>
      </CardFooter>
    </Card>
  )
}
