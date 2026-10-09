import { inconsolata, inter } from '@/lib/fonts'
import { docsMtb } from '@/lib/mtb'
import type { Preview } from '@storybook/nextjs-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import { Mtb } from 'material-theme-builder/react'

import './preview.css'
import '../src/app/globals.css'

// The fonts, as the root layout loads them — which Storybook never renders. Their variables,
// `--font-sans` and `--font-mono`, are defined by `next/font`'s classes and nowhere else:
// `globals.css` only hands them to Tailwind (`--font-sans: var(--font-sans)`), so without the
// classes `--font-sans` refers to itself, is invalid, and every story is set in the browser's
// default serif, code included, and Chromatic baselines it that way. The same classes on the same
// `<html>` as the layout (`@storybook/nextjs-vite` resolves `next/font/google`), from the same
// module, so the stories cannot drift from the site.
document.documentElement.classList.add(inconsolata.variable, 'font-sans', inter.variable)

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
