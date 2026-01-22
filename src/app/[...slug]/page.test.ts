import { test, expect } from '@chromatic-com/playwright'

//
// Test any docs/**/*.mdx page
//

test('introduction', async ({ page }) => {
  await page.goto('/getting-started/introduction')
  await expect(page).toHaveScreenshot({ fullPage: true })
})
test('introduction dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/getting-started/introduction')
  await expect(page).toHaveScreenshot({ fullPage: true })
})

//

test('authoring', async ({ page }) => {
  await page.goto('/getting-started/authoring')
  await expect(page).toHaveScreenshot({ fullPage: true })
})
test('authoring dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/getting-started/authoring')
  await expect(page).toHaveScreenshot({ fullPage: true })
})

//

test('github-actions', async ({ page }) => {
  await page.goto('/getting-started/github-actions')
  await expect(page).toHaveScreenshot({ fullPage: true })
})
test('github-actions dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/getting-started/github-actions')
  await expect(page).toHaveScreenshot({ fullPage: true })
})
