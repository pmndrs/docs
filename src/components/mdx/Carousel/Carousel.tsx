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
 * - `opts`: Embla's options (https://www.embla-carousel.com/api/options/), e.g.
 *   `{ loop: true, align: 'start' }`. Plain data only: the MDX runs on the server, the carousel
 *   in the browser.
 * - `orientation`: `horizontal` (default) or `vertical`.
 */
export function Carousel({
  orientation = 'horizontal',
  className,
  ...props
}: Omit<ComponentProps<typeof UiCarousel>, 'setApi' | 'plugins'>) {
  // `.post-container > *` (globals.css) makes this root `display: block`: as `relative`, it still
  // anchors the arrows. The padding is the gutter the arrows sit in (`size-8`, 0.5rem from the
  // edge): on the sides of a horizontal carousel, above and below a vertical one. The arrows
  // (server components too) read the orientation from `data-orientation`, not from the context.
  return (
    <UiCarousel
      orientation={orientation}
      data-orientation={orientation}
      className={cn(
        'group/carousel my-6',
        orientation === 'vertical' ? 'py-12' : 'px-12',
        className,
      )}
      {...props}
    />
  )
}

/**
 * The strip of `CarouselItem`s. A vertical carousel needs a height on it, e.g. `h-80`.
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

// The ui arrows are 3rem outside the root (`-left-12`, `-top-12`…): back inside its gutter. With
// their orientation variants, these only add to the ui classes, without replacing their
// counterparts of the other orientation (`left-1/2` of a vertical arrow stays).
const previousClassName =
  'group-data-[orientation=horizontal]/carousel:left-2 group-data-[orientation=vertical]/carousel:top-2'
const nextClassName =
  'group-data-[orientation=horizontal]/carousel:right-2 group-data-[orientation=vertical]/carousel:bottom-2'

/**
 * The arrow to the previous slide, in the root's gutter: left, or top of a vertical carousel.
 */
export function CarouselPrevious({
  className,
  ...props
}: ComponentProps<typeof UiCarouselPrevious>) {
  return <UiCarouselPrevious className={cn(previousClassName, className)} {...props} />
}

/**
 * The arrow to the next slide, in the root's gutter: right, or bottom of a vertical carousel.
 */
export function CarouselNext({ className, ...props }: ComponentProps<typeof UiCarouselNext>) {
  return <UiCarouselNext className={cn(nextClassName, className)} {...props} />
}
