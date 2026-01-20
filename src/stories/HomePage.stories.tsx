import type { Meta, StoryObj } from '@storybook/react'
import Page from '@/app/page'

const meta = {
  title: 'Pages/Home',
  component: Page,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof Page>

export default meta
type Story = StoryObj<typeof meta>

export const LibraryIndex: Story = {
  name: 'Library Index Page',
}
