import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'

export function Summary({ className, ...props }: ComponentProps<'summary'>) {
  return <summary className={cn('mb-2', className)} {...props} />
}
