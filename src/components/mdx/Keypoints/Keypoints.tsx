import cn from '@/lib/cn'
import { ComponentProps } from 'react'
import { li as Li } from '../li'
import { ul as Ul } from '../ul'

export function Keypoints({
  title = 'Keypoints',
  children,
  className,
  ...props
}: { title: string } & ComponentProps<'section'>) {
  return (
    <section
      {...props}
      className={cn(className, 'bg-surface-dim my-8 rounded-xl border border-outline-variant p-6')}
    >
      <h2 className="mb-6 text-2xl font-bold">{title}</h2>

      <Ul className="mb-0 text-sm">{children}</Ul>
    </section>
  )
}

export function KeypointsItem(props: ComponentProps<'li'>) {
  return <Li {...props} />
}
