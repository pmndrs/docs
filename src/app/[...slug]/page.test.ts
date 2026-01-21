import { test, expect } from '@chromatic-com/playwright'

//
// Test any docs/**/*.mdx page
//

test('/getting-started/introduction', async ({ page }) => {
  await page.goto('/getting-started/introduction')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true })
})

//

test('/getting-started/authoring', async ({ page }) => {
  await page.goto('/getting-started/authoring')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true })
})

//

test('/getting-started/github-actions', async ({ page }) => {
  await page.goto('/getting-started/github-actions')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true })
})
