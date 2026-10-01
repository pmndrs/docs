import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Mtb } from 'material-theme-builder/react'

import { Badge } from '../Badge'
import { p as P } from '../index'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs'
import { allModes } from '../../../../.storybook/modes'

const meta = {
  component: Tabs,
  parameters: {
    chromatic: {
      modes: {
        light: allModes['light'],
        dark: allModes['dark'],
      },
    },
  },
  decorators: [
    // The theme the website builds in `src/app/layout.tsx`, with its default color
    (Story) => (
      <Mtb source="#323e48" scheme="tonalSpot">
        <Story />
      </Mtb>
    ),
  ],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

/**
 * `defaultValue` names the tab shown first. Hover the others, or tab to them: arrow keys move
 * between them.
 */
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="react">
      <TabsList>
        <TabsTrigger value="react">React</TabsTrigger>
        <TabsTrigger value="vue">Vue</TabsTrigger>
        <TabsTrigger value="svelte">Svelte</TabsTrigger>
      </TabsList>
      <TabsContent value="react">
        <P>React is a library for building user interfaces out of components.</P>
      </TabsContent>
      <TabsContent value="vue">
        <P>Vue is a progressive framework for building user interfaces.</P>
      </TabsContent>
      <TabsContent value="svelte">
        <P>Svelte is a compiler that turns components into plain JavaScript.</P>
      </TabsContent>
    </Tabs>
  ),
}

/**
 * A trigger holds any markup, e.g. a `Badge`.
 */
export const RichTrigger: Story = {
  render: () => (
    <Tabs defaultValue="react">
      <TabsList>
        <TabsTrigger value="react">
          React <Badge>19</Badge>
        </TabsTrigger>
        <TabsTrigger value="vue">Vue</TabsTrigger>
      </TabsList>
      <TabsContent value="react">
        <P>React 19 is the current major version.</P>
      </TabsContent>
      <TabsContent value="vue">
        <P>Vue 3 is the current major version.</P>
      </TabsContent>
    </Tabs>
  ),
}
