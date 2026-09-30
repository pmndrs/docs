import cn from '@/lib/cn'
import { ComponentProps } from 'react'

export function Intro({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <section {...props} className={cn(className, 'my-6 text-xl leading-relaxed')}>
      <h2 className="sr-only">Summary</h2>
      {children}
    </section>
  )
}
