import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A simple button component demonstrating Storybook setup.',
      },
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// Stories render the Button as it would be used in MDX
export const Default: Story = {
  args: {},
  render: () => (
    <Button>Click me</Button>
  ),
}

export const Primary: Story = {
  args: {},
  render: () => (
    <Button>Primary Button</Button>
  ),
}

export const LongText: Story = {
  args: {},
  render: () => (
    <Button>This is a button with longer text</Button>
  ),
}
