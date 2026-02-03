import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Intro } from './Intro'
import { allModes } from '../../../../.storybook/modes'

const meta = {
  component: Intro,
  parameters: {
    chromatic: {
      modes: {
        light: allModes['light'],
        dark: allModes['dark'],
      },
    },
  },
} satisfies Meta<typeof Intro>

export default meta
type Story = StoryObj<typeof meta>

export const St1: Story = {
  args: {},
  render: (args) => <Intro {...args}>This is an intro section.</Intro>,
}
