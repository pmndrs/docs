import cn from '@/lib/cn'
import { ComponentProps } from 'react'

/**
 * Numbered steps, like shadcn/ui's docs: one per `Step` among its children, the content of a
 * step being whatever follows it.
 *
 * The number is the `Step` heading's `::before`, from a CSS counter: no script. From `md` up,
 * the numbers hang on a vertical line, the wrapper's left border, their own border of the
 * page's color cutting through it.
 */
export function Steps({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn(
        'mb-12 [counter-reset:step] md:relative md:ml-4 md:border-l md:border-outline-variant md:pl-8',

        // Each `Step` is one more step, its number before it
        '[&>h3]:flex [&>h3]:items-center [&>h3]:gap-3 [&>h3]:[counter-increment:step]',

        // The number: a circle, inline before the heading on small screens…
        '[&>h3]:before:inline-flex [&>h3]:before:size-9 [&>h3]:before:shrink-0 [&>h3]:before:items-center [&>h3]:before:justify-center [&>h3]:before:rounded-full [&>h3]:before:border-4 [&>h3]:before:border-surface [&>h3]:before:bg-surface-container-high [&>h3]:before:font-mono [&>h3]:before:text-base [&>h3]:before:font-medium [&>h3]:before:text-on-surface-variant [&>h3]:before:content-[counter(step)]',

        // …and centered on the line from `md` up (vertically, it stays where the heading's
        // `items-center` puts it)
        'md:[&>h3]:before:absolute md:[&>h3]:before:left-[-0.5px] md:[&>h3]:before:-translate-x-1/2',

        className,
      )}
    />
  )
}

/**
 * The heading of a step, in `Steps`. A plain `h3` rather than a `###`: no anchor, no entry in
 * the table of contents.
 */
export function Step({ className, ...props }: ComponentProps<'h3'>) {
  return (
    <h3
      {...props}
      className={cn('mb-4 mt-8 scroll-mt-4 text-lg font-medium tracking-tight', className)}
    />
  )
}
