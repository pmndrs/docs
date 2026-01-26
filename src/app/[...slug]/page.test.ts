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
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('authoring dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/getting-started/authoring')
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

//
// Test OG images
//

test('introduction og', async ({ page }) => {
  await page.goto('/')
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head><title>OG Image: Introduction</title></head>
      <body style="margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #000;">
        <img src="/og/getting-started/introduction.png" alt="Introduction OG Image" style="max-width: 100%; height: auto;" />
      </body>
    </html>
  `)
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})

test('authoring og', async ({ page }) => {
  await page.goto('/')
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head><title>OG Image: Authoring</title></head>
      <body style="margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #000;">
        <img src="/og/getting-started/authoring.png" alt="Authoring OG Image" style="max-width: 100%; height: auto;" />
      </body>
    </html>
  `)
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})

test('github-actions og', async ({ page }) => {
  await page.goto('/')
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head><title>OG Image: GitHub Actions</title></head>
      <body style="margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #000;">
        <img src="/og/getting-started/github-actions.png" alt="GitHub Actions OG Image" style="max-width: 100%; height: auto;" />
      </body>
    </html>
  `)
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
