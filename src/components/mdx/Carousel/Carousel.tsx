import {
  Carousel as UiCarousel,
  CarouselContent as UiCarouselContent,
  CarouselItem as UiCarouselItem,
  CarouselNext as UiCarouselNext,
  CarouselPrevious as UiCarouselPrevious,
} from '@/components/ui/carousel'
import { cn } from 'cn'
import type { ComponentProps } from 'react'

//
// shadcn's Carousel (https://ui.shadcn.com/docs/components/base/carousel), as is: the same parts,
// the same props. Only the default placement of the arrows differs: inside the article's width,
// in a gutter the root keeps on each side, where shadcn puts them outside the root. A `className`
// adds to it.
//
// Server components: no state of their own, so they work in MDX compiled on the server
// (next-mdx-remote/rsc), handing everything to the client ui ones. The slides are rendered on the
// server too, as children: only the scrolling and the arrows wait for the page's JavaScript.
//

/**
 * Slides shown one (or a few) at a time, scrolled by dragging, the arrows, or the arrow keys.
 *
 * - `opts`: embla's options (https://www.embla-carousel.com/api/options/), e.g.
 *   `{ loop: true, align: 'start' }`. Plain data only: the MDX runs on the server, the carousel
 *   in the browser.
 * - `orientation`: `horizontal` (default) or `vertical`.
 */
export function Carousel({
  className,
  ...props
}: Omit<ComponentProps<typeof UiCarousel>, 'setApi' | 'plugins'>) {
  // `.post-container > *` (globals.css) makes this root `display: block`: as `relative`, it still
  // anchors the arrows. `px-12` is the gutter the arrows sit in (`left-2`/`right-2`, `size-8`).
  return <UiCarousel className={cn('my-6 px-12', className)} {...props} />
}

/**
 * The strip of `CarouselItem`s.
 */
export function CarouselContent(props: ComponentProps<typeof UiCarouselContent>) {
  return <UiCarouselContent {...props} />
}

/**
 * A slide. Full width by default: `basis-1/2`, `md:basis-1/3`… shows several at once.
 */
export function CarouselItem(props: ComponentProps<typeof UiCarouselItem>) {
  return <UiCarouselItem {...props} />
}

/**
 * The arrow to the previous slide, in the root's left gutter.
 */
export function CarouselPrevious({
  className,
  ...props
}: ComponentProps<typeof UiCarouselPrevious>) {
  return <UiCarouselPrevious className={cn('left-2', className)} {...props} />
}

/**
 * The arrow to the next slide, in the root's right gutter.
 */
export function CarouselNext({ className, ...props }: ComponentProps<typeof UiCarouselNext>) {
  return <UiCarouselNext className={cn('right-2', className)} {...props} />
}
