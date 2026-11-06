import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Mtb } from 'material-theme-builder/react'

import { ScrollArea, ScrollBar } from './ScrollArea'
import { allModes } from '../../../../.storybook/modes'

const meta = {
  component: ScrollArea,
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
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

const items = Array.from({ length: 20 }, (_, index) => `Item ${index + 1}`)

function Item({ children }: { children: string }) {
  return (
    <div className="shrink-0 rounded-lg bg-surface-container px-3 py-2.5 text-on-surface">
      {children}
    </div>
  )
}

/**
 * A vertical list in a box of a fixed height, with the custom scrollbar.
 */
export const Default: Story = {
  args: { className: 'h-72 w-64 rounded-2xl border' },
  render: (args) => (
    <ScrollArea {...args}>
      <div className="flex flex-col gap-1.5 p-1.5">
        {items.map((item) => (
          <Item key={item}>{item}</Item>
        ))}
      </div>
    </ScrollArea>
  ),
}

/**
 * A row wider than the box, with a `ScrollBar orientation="horizontal"`.
 */
export const Horizontal: Story = {
  args: { className: 'w-96 rounded-2xl border' },
  render: (args) => (
    <ScrollArea {...args}>
      <div className="flex w-max gap-1.5 p-1.5">
        {items.map((item) => (
          <Item key={item}>{item}</Item>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
}

/**
 * shadcn's `scroll-fade` on the viewport: its edges fade where there is more to scroll to.
 */
export const WithFade: Story = {
  args: {
    className: 'h-72 w-64 rounded-2xl border *:data-[slot=scroll-area-viewport]:scroll-fade',
  },
  render: Default.render,
}
