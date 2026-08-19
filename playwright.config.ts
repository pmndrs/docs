import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
// The website is served on 3000 unless `PORT` says otherwise, which `pnpm dev` reads too
const url = `http://localhost:${process.env.PORT ?? 3000}`

export default defineConfig({
  testDir: './src/app',
  testIgnore: '**/route.test.ts',
  use: {
    baseURL: url,
  },
  expect: {
    toHaveScreenshot: { stylePath: './playwright.screenshot.css' },
  },
  projects: [
    {
      name: 'w375',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: 'w1440',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url,
  },
})
