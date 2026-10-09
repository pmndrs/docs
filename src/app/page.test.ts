import { test, expect } from '@chromatic-com/playwright'

// `toHaveScreenshot` never compares against a baseline (see `updateSnapshots` in
// playwright.config.ts): it waits for a settled page. Chromatic, which captures at the end of
// the test, holds the baselines

test('home', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('home dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
