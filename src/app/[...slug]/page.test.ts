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

test('authoring/introduction', async ({ page }) => {
  await page.goto('/authoring/introduction')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('authoring/introduction dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/authoring/introduction')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})

//

test('authoring/intro', async ({ page }) => {
  await page.goto('/authoring/intro')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('authoring/intro dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/authoring/intro')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})

//

test('authoring/keypoints', async ({ page }) => {
  await page.goto('/authoring/keypoints')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('authoring/keypoints dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/authoring/keypoints')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})

//

test('authoring/img', async ({ page }) => {
  await page.goto('/authoring/img')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('authoring/img dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/authoring/img')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})

//

test('authoring/code', async ({ page }) => {
  await page.goto('/authoring/code')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('authoring/code dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/authoring/code')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})

//

test('authoring/mermaid', async ({ page }) => {
  await page.goto('/authoring/mermaid')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('authoring/mermaid dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/authoring/mermaid')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})

//

test('authoring/grid', async ({ page }) => {
  await page.goto('/authoring/grid')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('authoring/grid dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/authoring/grid')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})

//

test('authoring/sandpack', async ({ page }) => {
  await page.goto('/authoring/sandpack')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('authoring/sandpack dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/authoring/sandpack')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})

//

test('authoring/codesandbox', async ({ page }) => {
  await page.goto('/authoring/codesandbox')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('authoring/codesandbox dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/authoring/codesandbox')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})

//

test('authoring/gha', async ({ page }) => {
  await page.goto('/authoring/gha')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('authoring/gha dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/authoring/gha')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})

//

test('authoring/hint', async ({ page }) => {
  await page.goto('/authoring/hint')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('authoring/hint dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/authoring/hint')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})

//

test('authoring/contributors', async ({ page }) => {
  await page.goto('/authoring/contributors')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('authoring/contributors dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/authoring/contributors')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})

//

test('authoring/backers', async ({ page }) => {
  await page.goto('/authoring/backers')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('authoring/backers dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/authoring/backers')
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
