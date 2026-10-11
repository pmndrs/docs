import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

type KeypointsProps = ComponentProps<'section'> & {
  /** Heading displayed above the list of article takeaways. */
  title?: string
}

/**
 * A titled section of article takeaways, presented with the consumer's Card primitive.
 */
export function Keypoints({ title = 'Keypoints', children, className, ...props }: KeypointsProps) {
  return (
    <section {...props} className={cn('my-8', className)}>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{title}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="ms-6 list-disc">{children}</ul>
        </CardContent>
      </Card>
    </section>
  )
}

/**
 * One takeaway in a Keypoints list, retaining native list-item attributes.
 * @param props Native list-item attributes and the takeaway content.
 */
export function KeypointsItem(props: ComponentProps<'li'>) {
  return <li className="my-1" {...props} />
}
