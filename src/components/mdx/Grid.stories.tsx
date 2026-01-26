import type { Meta, StoryObj } from '@storybook/react'
import { Grid } from './Grid'

const meta = {
  title: 'MDX Components/Grid',
  component: Grid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A responsive grid layout component for organizing content in columns.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Grid>

export default meta
type Story = StoryObj<typeof meta>

export const FourColumns: Story = {
  args: {
    cols: 4,
    children: (
      <>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
        <li>Item 4</li>
      </>
    ),
  },
}

export const ThreeColumns: Story = {
  args: {
    cols: 3,
    children: (
      <>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </>
    ),
  },
}

export const TwoColumns: Story = {
  args: {
    cols: 2,
    children: (
      <>
        <li>Item 1</li>
        <li>Item 2</li>
      </>
    ),
  },
}

export const WithLinks: Story = {
  args: {
    cols: 4,
    children: (
      <>
        <li>
          <a href="#">Documentation Link 1</a>
        </li>
        <li>
          <a href="#">Documentation Link 2</a>
        </li>
        <li>
          <a href="#">Documentation Link 3</a>
        </li>
        <li>
          <a href="#">Documentation Link 4</a>
        </li>
      </>
    ),
  },
}
