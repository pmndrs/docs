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
 * A titled fence, ```` ```ts title="lib/utils.ts" ````: a header shows the file name, with the
 * icon of its file type and the copy button.
 */
export const WithTitle: Story = {
  args: {
    className: 'language-ts',
    title: 'lib/utils.ts',
    children: (
      <code className="language-ts">{`import { clsx, type ClassValue } from 'clsx'\nimport { twMerge } from 'tailwind-merge'\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs))\n}`}</code>
    ),
  },
}

/**
 * The icon follows the file extension: CSS.
 */
export const WithTitleCss: Story = {
  args: {
    className: 'language-css',
    title: 'src/styles/globals.css',
    children: (
      <code className="language-css">{`@import 'tailwindcss';\n\n:root {\n  --radius: 0.625rem;\n}`}</code>
    ),
  },
}

/**
 * JSON.
 */
export const WithTitleJson: Story = {
  args: {
    className: 'language-json',
    title: 'package.json',
    children: (
      <code className="language-json">{`{\n  "name": "my-app",\n  "private": true\n}`}</code>
    ),
  },
}

/**
 * A shell script: a terminal, as the package-manager tabs show.
 */
export const WithTitleShell: Story = {
  args: {
    className: 'language-bash',
    title: 'scripts/setup.sh',
    children: <code className="language-bash">{`#!/bin/sh\nset -e\n\necho "Setting up"`}</code>,
  },
}

/**
 * An unknown file type: a generic code file. A long name is truncated.
 */
export const WithTitleUnknown: Story = {
  args: {
    className: 'language-rust',
    title: 'crates/very/long/path/to/a/deeply/nested/module/with/a/long/name/main.rs',
    children: <code className="language-rust">{`fn main() {\n    println!("Hello");\n}`}</code>,
  },
}

const longCss = `@import 'tailwindcss';\n\n@theme inline {\n  --color-background: var(--background);\n  --color-foreground: var(--foreground);\n  --color-primary: var(--primary);\n  --color-primary-foreground: var(--primary-foreground);\n  --radius-sm: calc(var(--radius) * 0.6);\n  --radius-md: calc(var(--radius) * 0.8);\n  --radius-lg: var(--radius);\n}\n\n:root {\n  --radius: 0.625rem;\n  --background: oklch(1 0 0);\n  --foreground: oklch(0.145 0 0);\n  --primary: oklch(0.205 0 0);\n  --primary-foreground: oklch(0.985 0 0);\n}\n\n.dark {\n  --background: oklch(0.145 0 0);\n  --foreground: oklch(0.985 0 0);\n  --primary: oklch(0.922 0 0);\n  --primary-foreground: oklch(0.205 0 0);\n}\n\n@layer base {\n  body {\n    @apply bg-background text-foreground;\n  }\n}`

/**
 * A collapsible fence, ```` ```css title="src/styles/globals.css" collapsible ````: only its first
 * lines show, under a fade, until "Expand" (in the header, or the fade itself) opens it.
 */
export const Collapsible: Story = {
  args: {
    className: 'language-css',
    title: 'src/styles/globals.css',
    collapsible: true,
    children: <code className="language-css">{longCss}</code>,
  },
}

/**
 * Collapsible without a title: a header still holds "Expand" and the copy button, clear of the
 * first line.
 */
export const CollapsibleWithoutTitle: Story = {
  args: {
    className: 'language-css',
    collapsible: true,
    children: <code className="language-css">{longCss}</code>,
  },
}

/**
 * Collapsible, but short enough to show whole: a plain block, without fade nor "Expand".
 */
export const CollapsibleShort: Story = {
  args: {
    className: 'language-css',
    title: 'src/styles/globals.css',
    collapsible: true,
    children: <code className="language-css">{`:root {\n  --radius: 0.625rem;\n}`}</code>,
  },
}

/**
 * Collapsible, short and without a title: the copy button floats top right, as a plain block's.
 */
export const CollapsibleShortWithoutTitle: Story = {
  args: {
    className: 'language-css',
    collapsible: true,
    children: <code className="language-css">{`:root {\n  --radius: 0.625rem;\n}`}</code>,
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
