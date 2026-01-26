import type { Meta, StoryObj } from '@storybook/react'
import { Gha } from '../Gha'

const meta = {
  title: 'MDX Components/GitHub Alerts',
  component: Gha,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Gha>

export default meta
type Story = StoryObj<typeof meta>

export const Note: Story = {
  args: {
    keyword: 'NOTE',
    children: 'This is a note alert. Use it to provide additional information.',
  },
}

export const Tip: Story = {
  args: {
    keyword: 'TIP',
    children: 'This is a tip alert. Use it to share helpful advice.',
  },
}

export const Important: Story = {
  args: {
    keyword: 'IMPORTANT',
    children: 'This is an important alert. Use it to highlight critical information.',
  },
}

export const Warning: Story = {
  args: {
    keyword: 'WARNING',
    children: 'This is a warning alert. Use it to caution users about potential issues.',
  },
}

export const Caution: Story = {
  args: {
    keyword: 'CAUTION',
    children: 'This is a caution alert. Use it to warn about possible dangers.',
  },
}

export const WithMultipleParagraphs: Story = {
  args: {
    keyword: 'NOTE',
    children: (
      <>
        <p>First paragraph with important information.</p>
        <p>Second paragraph with additional details.</p>
        <p>Third paragraph with more context.</p>
      </>
    ),
  },
}
