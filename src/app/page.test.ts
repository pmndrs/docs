import { test, expect } from '@chromatic-com/playwright'

test('home', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot({ fullPage: true })
  //
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.reload()
  await expect(page).toHaveScreenshot({ fullPage: true })
})
