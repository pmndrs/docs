import { ScrollArea as UiScrollArea, ScrollBar as UiScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

//
// shadcn's ScrollArea (https://ui.shadcn.com/docs/components/base/scroll-area), as is: the same
// parts, the same props, with the vertical margin of the other blocks of an article.
//
// Server components: no state of their own, so they work in MDX compiled on the server
// (next-mdx-remote/rsc), handing everything to the client ui ones. The content is rendered on the
// server too, as children: only the custom scrollbars wait for the page's JavaScript.
//

/**
 * A box that scrolls its content, with a custom scrollbar. It needs a size to scroll within,
 * e.g. `h-72`. A vertical scrollbar is always there: add a `<ScrollBar orientation="horizontal" />`
 * for horizontal content.
 *
 * For a scroll-aware fade on its edges, put shadcn's `scroll-fade` (or `scroll-fade-x`) on its
 * viewport, the element that scrolls: `*:data-[slot=scroll-area-viewport]:scroll-fade`.
 */
export function ScrollArea({ className, ...props }: ComponentProps<typeof UiScrollArea>) {
  return <UiScrollArea className={cn('my-6', className)} {...props} />
}

/**
 * An extra scrollbar, e.g. `orientation="horizontal"`.
 */
export function ScrollBar(props: ComponentProps<typeof UiScrollBar>) {
  return <UiScrollBar {...props} />
}
