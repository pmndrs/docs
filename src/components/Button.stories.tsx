import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
    onClick: { action: 'clicked' },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Click me',
  },
}

export const Primary: Story = {
  args: {
    children: 'Primary Button',
  },
}

export const LongText: Story = {
  args: {
    children: 'This is a button with longer text',
  },
}
