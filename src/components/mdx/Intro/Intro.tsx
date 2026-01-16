import { cn } from '@/lib/utils'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { ComponentProps } from 'react'

export function Intro({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <section {...props} className={cn(className, 'my-6 text-xl leading-relaxed')}>
      <VisuallyHidden>
        <h2>Summary</h2>
      </VisuallyHidden>
      {children}
    </section>
  )
}
