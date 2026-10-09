import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

export function Keypoints({
  title = 'Keypoints',
  children,
  className,
  ...props
}: { title?: string } & ComponentProps<'section'>) {
  return (
    <section
      {...props}
      className={cn('bg-surface-dim my-8 rounded-xl border border-border p-6', className)}
    >
      <h2 className="mb-6 text-2xl font-bold">{title}</h2>

      <div className="mt-4 mb-0 text-sm">
        <ul className="ms-6 list-disc">{children}</ul>
      </div>
    </section>
  )
}

export function KeypointsItem(props: ComponentProps<'li'>) {
  return <li className="my-1" {...props} />
}
