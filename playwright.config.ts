import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './src/app',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: './start.sh',
    url: 'http://localhost:3000',
  },
})
