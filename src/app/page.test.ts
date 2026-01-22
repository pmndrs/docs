import { test, expect } from '@chromatic-com/playwright'

test('home', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot({ fullPage: true })
})
test('home dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  await expect(page).toHaveScreenshot({ fullPage: true })
})
