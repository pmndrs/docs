import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 120000, // 2 minutes timeout for docker operations
    hookTimeout: 120000,
  },
});
