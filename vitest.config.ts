import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      // Exclude Playwright tests
      '**/src/app/**/*.test.{ts,tsx}',
    ],
  },
})

