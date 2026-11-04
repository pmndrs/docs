import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Mtb } from 'material-theme-builder/react'

import { p as P } from '../index'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './Carousel'
import { allModes } from '../../../../.storybook/modes'

const meta = {
  component: Carousel,
  parameters: {
    chromatic: {
      modes: {
        light: allModes['light'],
        dark: allModes['dark'],
      },
    },
  },
  decorators: [
    // The theme the website builds in `src/app/layout.tsx`, with its default color
    (Story) => (
      <Mtb source="#323e48" scheme="tonalSpot">
        <Story />
      </Mtb>
    ),
  ],
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

const slides = ['React', 'Vue', 'Svelte', 'Angular', 'Solid']

function Slide({ children }: { children: string }) {
  return (
    <div className="flex aspect-video items-center justify-center rounded-2xl border bg-surface-container text-3xl font-bold text-on-surface">
      {children}
    </div>
  )
}

/**
 * One slide at a time. Drag, click the arrows, or focus it and use the arrow keys.
 */
export const Default: Story = {
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide}>
            <Slide>{slide}</Slide>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

/**
 * Several slides at once: a `basis-*` on each `CarouselItem`, with `align: 'start'` so the strip
 * starts on a slide.
 */
export const SeveralAtOnce: Story = {
  args: { opts: { align: 'start' } },
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide} className="basis-1/2 md:basis-1/3">
            <Slide>{slide}</Slide>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

/**
 * `loop: true`: the last slide is followed by the first, and both arrows stay enabled.
 */
export const Loop: Story = {
  args: { opts: { loop: true } },
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide}>
            <Slide>{slide}</Slide>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

/**
 * Any markup in a slide, e.g. a paragraph of text.
 */
export const RichSlides: Story = {
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        <CarouselItem>
          <P>React is a library for building user interfaces out of components.</P>
        </CarouselItem>
        <CarouselItem>
          <P>Vue is a progressive framework for building user interfaces.</P>
        </CarouselItem>
        <CarouselItem>
          <P>Svelte is a compiler that turns components into plain JavaScript.</P>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}
