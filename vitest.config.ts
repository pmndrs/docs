import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    exclude: [
      'node_modules',
      '**/page.test.{ts,tsx}', // exclude Playwright page tests
    ],
  },
})
