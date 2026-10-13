import { defineConfig, devices } from '@playwright/test'

// Match start.sh so an isolated check does not reuse another checkout's server.
const url = `http://localhost:${process.env.PORT ?? 3000}`

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './src/app',
  // The page tests only: every other `*.test.ts` under src/app is a Vitest unit test
  testMatch: '**/page.test.ts',
  // Chromatic is the visual assertion, not Playwright: no baseline is committed, and
  // `toHaveScreenshot` only serves to wait for a settled page before the capture. Rewriting
  // every screenshot means it never fails on a pixel difference, so the same run is green
  // locally and in CI; it still fails when the page never settles (no two consecutive stable
  // screenshots) within its timeout.
  // The setting is global: it would rewrite, and so pass, any `toMatchSnapshot` or
  // `toMatchAriaSnapshot` too. Do not add such assertions under this config
  updateSnapshots: 'all',
  use: {
    baseURL: url,
    launchOptions: {
      args: ['--use-mock-keychain', '--password-store=basic'],
    },
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
    url,
  },
})
