import * as React from 'react'
import cn from '@/lib/cn'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="skeleton" className={cn('cn-skeleton animate-pulse', className)} {...props} />
  )
}

export { Skeleton }
