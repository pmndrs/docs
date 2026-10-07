import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Mtb } from 'material-theme-builder/react'

import { Badge } from '../Badge'
import { h3 as H3, p as P } from '../index'
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
  args: { defaultValue: 'react' },
  render: (args) => (
    <Tabs {...args}>
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
  args: { defaultValue: 'react' },
  render: (args) => (
    <Tabs {...args}>
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

/**
 * The row of triggers wraps onto more lines when it doesn't fit, e.g. on a phone, here in a
 * narrow column.
 */
export const ManyTabs: Story = {
  args: { defaultValue: 'r3f' },
  render: (args) => (
    <div className="max-w-xs">
      <Tabs {...args}>
        <TabsList>
          <TabsTrigger value="r3f">React Three Fiber</TabsTrigger>
          <TabsTrigger value="three">Vanilla three.js</TabsTrigger>
          <TabsTrigger value="threlte">Threlte for Svelte</TabsTrigger>
          <TabsTrigger value="tresjs">TresJS for Vue</TabsTrigger>
          <TabsTrigger value="angular">Angular Three</TabsTrigger>
          <TabsTrigger value="react-native">React Native</TabsTrigger>
          <TabsTrigger value="webgpu">WebGPU renderer</TabsTrigger>
        </TabsList>
        <TabsContent value="r3f">
          <P>A React renderer for three.js.</P>
        </TabsContent>
        <TabsContent value="three">
          <P>three.js on its own, no framework.</P>
        </TabsContent>
        <TabsContent value="threlte">
          <P>three.js components for Svelte.</P>
        </TabsContent>
        <TabsContent value="tresjs">
          <P>three.js components for Vue.</P>
        </TabsContent>
        <TabsContent value="angular">
          <P>A custom Angular renderer for three.js.</P>
        </TabsContent>
        <TabsContent value="react-native">
          <P>React Three Fiber on iOS and Android.</P>
        </TabsContent>
        <TabsContent value="webgpu">
          <P>three.js drawing with WebGPU instead of WebGL.</P>
        </TabsContent>
      </Tabs>
    </div>
  ),
}

/**
 * A heading in a panel not shown: following a link to its anchor opens its tab, then scrolls to
 * it. As does loading the page with that `#hash`.
 */
export const AnchorInHiddenPanel: Story = {
  args: { defaultValue: 'react' },
  render: (args) => (
    <>
      <P>
        <a href="#with-vue">Go to With Vue</a>
      </P>
      <Tabs {...args}>
        <TabsList>
          <TabsTrigger value="react">React</TabsTrigger>
          <TabsTrigger value="vue">Vue</TabsTrigger>
        </TabsList>
        <TabsContent value="react">
          <H3 id="with-react">With React</H3>
          <P>Install the React bindings.</P>
        </TabsContent>
        <TabsContent value="vue">
          <H3 id="with-vue">With Vue</H3>
          <P>Install the Vue bindings.</P>
        </TabsContent>
      </Tabs>
    </>
  ),
}
