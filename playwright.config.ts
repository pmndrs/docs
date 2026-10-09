import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './src/app',
  // The page tests only: every other `*.test.ts` under src/app is a Vitest unit test
  testMatch: '**/page.test.ts',
  // Chromatic is the visual assertion, not Playwright: no baseline is committed, and
  // `toHaveScreenshot` only serves to wait for a settled page before the capture. Rewriting
  // every screenshot keeps it from ever failing, so the same run is green locally and in CI
  updateSnapshots: 'all',
  use: {
    baseURL: 'http://localhost:3000',
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
    command: './start.sh',
    url: 'http://localhost:3000',
  },
})
