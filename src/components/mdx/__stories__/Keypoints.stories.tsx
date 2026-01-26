import type { Meta, StoryObj } from '@storybook/react'
import { Keypoints, KeypointsItem } from '../Keypoints'

const meta = {
  title: 'MDX Components/Keypoints',
  component: Keypoints,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Keypoints>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Keypoints',
    children: (
      <>
        <KeypointsItem>First key point about the topic</KeypointsItem>
        <KeypointsItem>Second important point to remember</KeypointsItem>
        <KeypointsItem>Third essential concept to understand</KeypointsItem>
      </>
    ),
  },
}

export const CustomTitle: Story = {
  args: {
    title: 'Key Takeaways',
    children: (
      <>
        <KeypointsItem>Learn the fundamentals</KeypointsItem>
        <KeypointsItem>Practice regularly</KeypointsItem>
        <KeypointsItem>Build real projects</KeypointsItem>
      </>
    ),
  },
}

export const ManyPoints: Story = {
  args: {
    title: 'Important Notes',
    children: (
      <>
        <KeypointsItem>Point number one</KeypointsItem>
        <KeypointsItem>Point number two</KeypointsItem>
        <KeypointsItem>Point number three</KeypointsItem>
        <KeypointsItem>Point number four</KeypointsItem>
        <KeypointsItem>Point number five</KeypointsItem>
        <KeypointsItem>Point number six</KeypointsItem>
      </>
    ),
  },
}
