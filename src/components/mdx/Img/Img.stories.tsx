import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ImgClient } from './Img.client'
import { allModes } from '../../../../.storybook/modes'

const meta = {
  component: ImgClient,
  parameters: {
    chromatic: {
      modes: {
        light: allModes['light'],
        dark: allModes['dark'],
      },
    },
  },
} satisfies Meta<typeof ImgClient>

export default meta
type Story = StoryObj<typeof meta>

export const St1: Story = {
  name: 'Basic image',
  args: {
    src: 'https://picsum.photos/400/300',
    alt: 'A sample image',
  },
}

export const St2: Story = {
  name: 'Image with custom dimensions',
  args: {
    src: 'https://picsum.photos/800/600',
    alt: 'Custom size image',
    width: 400,
    height: 300,
  },
}

export const St3: Story = {
  name: 'Image with width only',
  args: {
    src: 'https://picsum.photos/800/600',
    alt: 'Width only image',
    width: 500,
  },
}

export const St4: Story = {
  name: 'Image with height only',
  args: {
    src: 'https://picsum.photos/800/600',
    alt: 'Height only image',
    height: 400,
  },
}

export const St5: Story = {
  name: 'Image with custom className',
  args: {
    src: 'https://picsum.photos/400/300',
    alt: 'Custom styled image',
    className: 'border-4 border-blue-500',
  },
}
