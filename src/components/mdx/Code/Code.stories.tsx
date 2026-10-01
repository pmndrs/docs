import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Mtb } from 'material-theme-builder/react'

import { toPackageManagers } from '@/utils/packageManagers'
import { Code } from './Code'
import { allModes } from '../../../../.storybook/modes'

const meta = {
  component: Code,
  parameters: {
    chromatic: {
      modes: {
        light: allModes['light'],
        dark: allModes['dark'],
      },
    },
  },
  decorators: [
    // The theme the website builds in `src/app/layout.tsx`, with its default color: the code
    // block colors are its tokens.
    (Story) => (
      <Mtb source="#323e48" scheme="tonalSpot">
        <Story />
      </Mtb>
    ),
  ],
} satisfies Meta<typeof Code>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A code block, as a ```tsx fence gives it (here without Prism's highlighting).
 */
export const Plain: Story = {
  args: {
    className: 'language-tsx',
    children: (
      <code className="language-tsx">{`function Hi({ who }: { who: string }) {\n  return <p>Hello, {who}!</p>\n}`}</code>
    ),
  },
}

/**
 * A ```bash fence of npm commands: a tab per package manager. The pick is the same for every
 * command of the page, and remembered.
 */
export const PackageManagers: Story = {
  args: {
    className: 'language-bash',
    ...toPackageManagers('npm install three @react-three/fiber'),
  },
}

/**
 * Several lines, comments included.
 */
export const PackageManagersMultiline: Story = {
  args: {
    className: 'language-bash',
    ...toPackageManagers('# Create the app\nnpm create vite@latest my-app\n\nnpm run dev'),
  },
}
