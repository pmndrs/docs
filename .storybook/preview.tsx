import { docsMtb } from '@/lib/mtb'
import type { Preview } from '@storybook/nextjs-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import { Mtb } from 'material-theme-builder/react'

import './preview.css'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    // The app defines `--md-sys-color-*` from its root layout, which Storybook
    // never renders — so without this, every story runs against an undefined
    // palette. And since the shadcn remap points the stock variables at MD3
    // roles, that takes `--background` and `--primary` down with it: components
    // render colourless, silently, and Chromatic baselines them that way.
    //
    // The app mounts `<Mtb>` there (through `PrimaryColorMtb`, which adds the
    // reader's picks); the stories get the same palette, at its defaults.
    (Story) => (
      <Mtb {...docsMtb}>
        <Story />
      </Mtb>
    ),
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
}

export default preview
