import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Keypoints, KeypointsItem } from './Keypoints'
import { allModes } from '../../../../.storybook/modes'

const meta = {
  component: Keypoints,
  parameters: {
    chromatic: {
      modes: {
        light: allModes['light'],
        dark: allModes['dark'],
      },
    },
  },
} satisfies Meta<typeof Keypoints>

export default meta
type Story = StoryObj<typeof meta>

export const St1: Story = {
  name: 'No items',
  args: {
    title: 'Key points',
  },
  render: (args) => <Keypoints {...args}>lorem10</Keypoints>,
}

export const St2: Story = {
  name: 'With items',
  args: {
    title: 'Key points',
  },
  render: (args) => (
    <Keypoints {...args}>
      <KeypointsItem>First key point</KeypointsItem>
      <KeypointsItem>Second key point</KeypointsItem>
      <KeypointsItem>Third key point</KeypointsItem>
    </Keypoints>
  ),
}
