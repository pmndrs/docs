import { test, expect } from '@chromatic-com/playwright'

//
// Test OG images - ensures generated thumbnails are captured by Chromatic
//

test('og-images gallery', async ({ page }) => {
  await page.goto('/getting-started/introduction')
  await page.waitForLoadState('networkidle')

  // Create a simple page to display all OG images
  await page.evaluate(() => {
    const ogImages = [
      '/og/getting-started/introduction.png',
      '/og/getting-started/authoring.png',
      '/og/getting-started/github-actions.png',
    ]

    document.body.innerHTML = `
      <div style="padding: 20px; background: #1a1a1a;">
        <h1 style="color: white; margin-bottom: 20px;">Generated OG Images</h1>
        <div style="display: grid; grid-template-columns: 1fr; gap: 20px;">
          ${ogImages
            .map(
              (src) => `
            <div>
              <img src="${src}" alt="OG Image" style="width: 100%; max-width: 1200px; border: 2px solid #333;" />
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `
  })

  await page.waitForTimeout(1000) // Wait for images to load
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
