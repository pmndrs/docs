// Use Chromatic's wrapper instead of standard Playwright
import { test, expect } from '@chromatic-com/playwright'

test('Homepage Visual', async ({ page }) => {
  // Visit the home page
  await page.goto('/')

  // Wait for the page to load
  await page.waitForLoadState('networkidle')

  // Capture DOM snapshot for Chromatic
  await expect(page).toHaveScreenshot()
})
