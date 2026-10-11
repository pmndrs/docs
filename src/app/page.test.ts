import { test, expect } from '@chromatic-com/playwright'
import { libs } from '@/libs'

// `toHaveScreenshot` never compares against a baseline (see `updateSnapshots` in
// playwright.config.ts): it waits for a settled page. Chromatic, which captures at the end of
// the test, holds the baselines

test('home', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  for (const [id, library] of Object.entries(libs)) {
    const card = page.getByRole('group', { name: library.title, exact: true })
    await expect(card.getByRole('heading', { name: library.title, exact: true })).toBeVisible()
    await expect(card.getByRole('link', { name: /^(Docs|Documentation)$/ })).toHaveAttribute(
      'href',
      library.docs_url,
    )
    await expect(card.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute(
      'href',
      library.github,
    )
    await expect(card.getByRole('link', { name: `${library.title} on GitHub` })).toHaveAttribute(
      'href',
      library.github,
    )
    if ('llms_full' in library && library.llms_full) {
      await expect(card.getByRole('link', { name: 'MCP', exact: true })).toHaveAttribute(
        'href',
        `/mcp/live?lib=${encodeURIComponent(id)}`,
      )
    }
  }
  await expect(page.locator('main a a, main a button, main button a')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
test('home dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ fullPage: true, timeout: 10000 })
})
