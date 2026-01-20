// Use Chromatic's wrapper instead of standard Playwright
import { test, expect } from '@chromatic-com/playwright'

test('Documentation Page Visual', async ({ page }) => {
  // Visit a documentation page (using the default docs if MDX env is set)
  // This will redirect or show the homepage if no docs are configured
  await page.goto('/getting-started/introduction')

  // Wait for the page to load
  await page.waitForLoadState('networkidle')

  // Capture DOM snapshot for Chromatic
  await expect(page).toHaveScreenshot()
})
