import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Mtb } from 'material-theme-builder/react'

import { p as P } from '../index'
import { Step, Steps } from './Steps'
import { allModes } from '../../../../.storybook/modes'

const meta = {
  component: Steps,
  parameters: {
    chromatic: {
      modes: {
        light: allModes['light'],
        dark: allModes['dark'],
      },
    },
  },
  decorators: [
    // The theme the website builds in `src/app/layout.tsx`, and its page background: the
    // numbers' border is of that color, to cut through the line.
    (Story) => (
      <Mtb source="#323e48" scheme="tonalSpot">
        <div className="bg-surface p-8 text-on-surface">
          <Story />
        </div>
      </Mtb>
    ),
  ],
} satisfies Meta<typeof Steps>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Steps {...args}>
      <Step>Install the dependencies</Step>
      <P>Add the packages to your project.</P>
      <Step>Copy the code</Step>
      <P>Paste it into your project, and update the import paths.</P>
      <Step>Run it</Step>
      <P>Start your dev server.</P>
    </Steps>
  ),
}
