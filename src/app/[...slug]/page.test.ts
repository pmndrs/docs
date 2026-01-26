import { test, expect } from '@chromatic-com/playwright'

//
// Test any docs/**/*.mdx page
//

test('introduction', async ({ page }) => {
  await page.goto('/getting-started/introduction')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('introduction dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/getting-started/introduction')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})

//

test('authoring', async ({ page }) => {
  await page.goto('/getting-started/authoring')
  await page.waitForLoadState('networkidle')
  // Expand all <details> elements to show their content in screenshots
  await page.$$eval('details', (details) => details.forEach((el) => (el.open = true)))
  // Wait for any new content (like Sandpack iframes) to load after expanding
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('authoring dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/getting-started/authoring')
  await page.waitForLoadState('networkidle')
  // Expand all <details> elements to show their content in screenshots
  await page.$$eval('details', (details) => details.forEach((el) => (el.open = true)))
  // Wait for any new content (like Sandpack iframes) to load after expanding
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})

//

test('github-actions', async ({ page }) => {
  await page.goto('/getting-started/github-actions')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('github-actions dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/getting-started/github-actions')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
