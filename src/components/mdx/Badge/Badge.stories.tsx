import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Badge } from './Badge'
import { allModes } from '../../../../.storybook/modes'

const meta = {
  component: Badge,
  parameters: {
    chromatic: {
      modes: {
        light: allModes['light'],
        dark: allModes['dark'],
      },
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Link: Story = {
  args: {
    href: 'https://drei.pmnd.rs/?path=/story/abstractions-positionalaudio--positional-audio-scene-st',
    children: 'storybook',
  },
}

export const Text: Story = {
  args: {
    children: 'Dom only',
  },
}

export const Row: Story = {
  args: { children: 'storybook' },
  render: () => (
    <p className="my-4">
      <Badge href="https://drei.pmnd.rs/?path=/story/abstractions-positionalaudio--positional-audio-scene-st">
        storybook
      </Badge>{' '}
      <Badge href="https://r3f.docs.pmnd.rs/api/hooks#useloader">suspense</Badge>{' '}
      <Badge>Dom only</Badge>
    </p>
  ),
}
