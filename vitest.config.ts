import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [
      '**/page.test.tsx', // exclude Playwright page tests
    ],
  },
})
