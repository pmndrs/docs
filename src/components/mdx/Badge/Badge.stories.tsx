import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Fragment, type CSSProperties } from 'react'

import { Badge, type BadgeColor } from './Badge'
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
  decorators: [
    // The site's palette comes from the preview (`docsMtb`, as `src/app/layout.tsx` mounts it); the
    // brand colors, which `<Mtb>` doesn't carry, as the layout sets them
    (Story) => (
      <div
        style={
          {
            '--brand-storybook': '#ff4785',
            '--brand-npm': '#cb3837',
            '--brand-chromatic': '#fc521f',
          } as CSSProperties
        }
      >
        <Story />
      </div>
    ),
  ],
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

export const Colored: Story = {
  args: {
    href: 'https://r3f.docs.pmnd.rs/api/hooks#useloader',
    color: 'tip',
    children: 'suspense',
  },
}

const colors: BadgeColor[] = [
  'primary',
  'secondary',
  'tertiary',
  'error',
  'note',
  'tip',
  'important',
  'warning',
  'caution',
  'storybook',
  'npm',
  'chromatic',
]

/**
 * Every color role, as text then as links (hover them). Chromatic shoots it in light and dark.
 */
export const Colors: Story = {
  args: { children: 'badge' },
  render: () => (
    <>
      <p className="my-4">
        <Badge>default</Badge>
        {colors.map((color) => (
          <Fragment key={color}>
            {' '}
            <Badge color={color}>{color}</Badge>
          </Fragment>
        ))}
      </p>
      <p className="my-4">
        <Badge href="#">default</Badge>
        {colors.map((color) => (
          <Fragment key={color}>
            {' '}
            <Badge href="#" color={color}>
              {color}
            </Badge>
          </Fragment>
        ))}
      </p>
    </>
  ),
}

/**
 * Badges are inline, like links: in a row, as the MDX `<Badge>a</Badge>\n<Badge>b</Badge>`
 * becomes, and within running text — in a narrow column, they wrap as words do.
 */
export const Inline: Story = {
  args: { children: 'badge' },
  render: () => (
    <div className="max-w-xs">
      <p className="my-4">
        <Badge
          href="https://drei.pmnd.rs/?path=/story/abstractions-positionalaudio--positional-audio-scene-st"
          color="storybook"
          logo="storybook"
        >
          storybook
        </Badge>{' '}
        <Badge href="https://r3f.docs.pmnd.rs/api/hooks#useloader" color="tip">
          suspense
        </Badge>{' '}
        <Badge color="caution">Dom only</Badge>
      </p>
      <p className="my-4">
        Works with <Badge color="tip">suspense</Badge> and in the <Badge>Dom only</Badge>, so a
        badge sits in a sentence like any <a href="#">link</a> would.
      </p>
    </div>
  ),
}
