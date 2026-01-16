import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'

export function Details({ className, ...props }: ComponentProps<'details'>) {
  return <details className={cn('my-4', className)} {...props} />
}
