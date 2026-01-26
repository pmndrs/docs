import type { Meta, StoryObj } from '@storybook/react'
import { Details } from './Details'
import { Summary } from '../Summary'

const meta = {
  title: 'MDX Components/Details',
  component: Details,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Details>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <>
        <Summary>Click to expand</Summary>
        <p>This is the hidden content that will be revealed when you click the summary.</p>
      </>
    ),
  },
}

export const WithMultipleElements: Story = {
  args: {
    children: (
      <>
        <Summary>More information</Summary>
        <p>First paragraph of additional information.</p>
        <p>Second paragraph with more details.</p>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
          <li>List item 3</li>
        </ul>
      </>
    ),
  },
}

export const CodeExample: Story = {
  args: {
    children: (
      <>
        <Summary>Show code example</Summary>
        <pre>
          <code>{`function hello() {
  console.log("Hello, world!");
}`}</code>
        </pre>
      </>
    ),
  },
}
