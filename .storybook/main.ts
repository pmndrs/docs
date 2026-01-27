import type { StorybookConfig } from '@storybook/nextjs-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)', '../src/**/*.mdx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-themes'],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
}
export default config
