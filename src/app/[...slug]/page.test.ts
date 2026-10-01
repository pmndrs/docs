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
  // '/authoring/sandpack',
  '/authoring/codesandbox',
  '/authoring/gha',
  '/authoring/badge',
  '/authoring/hint',
  '/authoring/contributors',
  '/authoring/backers',
  '/authoring/entries',
  '/authoring/tabs',
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

//
// Tabs: a link to an element in a hidden panel opens its tab
//

test.describe('tabs anchor', () => {
  test.use({ disableAutoSnapshot: true })

  test('a link into a hidden tab panel opens its tab', async ({ page }) => {
    await page.goto('/authoring/tabs')
    await page.waitForLoadState('networkidle')

    const tabs = page.locator('[data-slot="tabs"]').first()
    const reactTab = tabs.getByRole('tab', { name: 'React' })
    const vueTab = tabs.getByRole('tab', { name: 'Vue' })
    const target = page.locator('#vue-target')

    // No page has a heading in a hidden panel: give the Vue panel's table an id instead, and add
    // links to it — a plain one, and one that, as Next's `<Link>`, prevents the click and changes
    // the URL with `history.pushState` (no `hashchange`)
    await page.evaluate(() => {
      const vueTab = Array.from(document.querySelectorAll('[role="tab"]')).find(
        (tab) => tab.textContent === 'Vue',
      )!
      const panel = document.getElementById(vueTab.getAttribute('aria-controls')!)!
      panel.querySelector('table')!.id = 'vue-target'

      const plainLink = document.createElement('a')
      plainLink.id = 'plain-link'
      plainLink.href = '#vue-target'
      plainLink.textContent = 'plain link'

      const pushStateLink = document.createElement('a')
      pushStateLink.id = 'push-state-link'
      pushStateLink.href = '#vue-target'
      pushStateLink.textContent = 'pushState link'
      pushStateLink.addEventListener('click', (event) => {
        event.preventDefault()
        history.pushState(null, '', pushStateLink.href)
      })

      document.body.prepend(plainLink, pushStateLink)
    })

    await expect(target).toBeHidden()

    // A Next `<Link>`, e.g. a search result
    await page.locator('#push-state-link').click()
    await expect(vueTab).toHaveAttribute('aria-selected', 'true')
    await expect(target).toBeVisible()

    // The hash the URL already has
    await reactTab.click()
    await expect(target).toBeHidden()
    await page.locator('#plain-link').click()
    await expect(vueTab).toHaveAttribute('aria-selected', 'true')
    await expect(target).toBeVisible()

    // Back/forward, or a URL typed in
    await reactTab.click()
    await expect(target).toBeHidden()
    await page.evaluate(() => (location.hash = ''))
    await page.evaluate(() => (location.hash = '#vue-target'))
    await expect(vueTab).toHaveAttribute('aria-selected', 'true')
    await expect(target).toBeVisible()

    // `history.pushState` with no click, e.g. Next's `router.push` of a search result picked with
    // the keyboard
    await reactTab.click()
    await expect(target).toBeHidden()
    await page.evaluate(() => history.pushState(null, '', location.pathname))
    await page.evaluate(() => history.pushState(null, '', '#vue-target'))
    await expect(vueTab).toHaveAttribute('aria-selected', 'true')
    await expect(target).toBeVisible()
  })
})
