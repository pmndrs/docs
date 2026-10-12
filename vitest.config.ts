import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      // Mirrors the tsconfig `paths`. Must come before the `@` prefix alias, which
      // would otherwise resolve this to src/package.json and fail to import ./route.
      '@/package.json': path.resolve(import.meta.dirname, './package.json'),
      '@/registry': path.resolve(import.meta.dirname, './registry'),
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    exclude: [
      'node_modules',
      '**/page.test.{ts,tsx}', // exclude Playwright page tests
    ],
  },
})
