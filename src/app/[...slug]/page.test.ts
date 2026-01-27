import { test, expect } from '@chromatic-com/playwright'

//
// Test any docs/**/*.mdx page
//

const timeout = 60000

const pages = [
  '/getting-started/introduction',
  '/authoring/introduction',
  '/authoring/intro',
  '/authoring/keypoints',
  '/authoring/img',
  '/authoring/code',
  '/authoring/mermaid',
  '/authoring/grid',
  '/authoring/sandpack',
  '/authoring/codesandbox',
  '/authoring/gha',
  '/authoring/hint',
  '/authoring/contributors',
  '/authoring/backers',
  '/github-actions/introduction',
]

for (const pagePath of pages) {
  const pageName = pagePath.replace(/\//g, '_').replace(/^_/, '')

  test(pageName, async ({ page }) => {
    await page.goto(pagePath)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot({ fullPage: true, timeout })
  })

  test(`${pageName} dark`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(pagePath)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot({ fullPage: true, timeout })
  })
}
