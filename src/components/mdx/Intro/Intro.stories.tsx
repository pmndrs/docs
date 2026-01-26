import type { Meta, StoryObj } from '@storybook/react'
import { Intro } from './Intro'

const meta = {
  title: 'MDX Components/Intro',
  component: Intro,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Intro>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children:
      'This is an introduction paragraph with larger text that provides a summary of the content.',
  },
}

export const MultiParagraph: Story = {
  args: {
    children: (
      <>
        <p>
          This is the first paragraph of the introduction, which provides an overview of what will
          be covered.
        </p>
        <p>This is the second paragraph that continues to set the context for the reader.</p>
      </>
    ),
  },
}

export const WithEmphasis: Story = {
  args: {
    children: (
      <p>
        This introduction contains <strong>bold text</strong> and <em>italic text</em> to emphasize
        important points.
      </p>
    ),
  },
}
