import { defineConfig, devices } from '@chromatic-com/playwright'

/**
 * Configuration for Chromatic visual tests
 * See https://www.chromatic.com/docs/playwright
 */
export default defineConfig({
  testDir: './src/app',
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
