import { test, expect } from '@chromatic-com/playwright'

test('home', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true })
})
