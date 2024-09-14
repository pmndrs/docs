import cn from '@/lib/cn'
import { ComponentProps } from 'react'

export function Intro({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={cn(className, 'my-6 text-xl leading-relaxed')} />
}
