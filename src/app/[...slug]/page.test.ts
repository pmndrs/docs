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

//
// Tabs: those of the same `syncKey` switch together, and remember the pick
//

test.describe('tabs syncKey', () => {
  test.use({ disableAutoSnapshot: true })

  test('tabs of the same syncKey switch together, and remember the pick', async ({ page }) => {
    await page.goto('/authoring/tabs')
    await page.waitForLoadState('networkidle')

    // The two of `syncKey="framework"`, the second one without Vue, and the first one of the page,
    // without a `syncKey`
    const allTabs = page.locator('[data-slot="tabs"]')
    const templates = allTabs.filter({ hasText: 'Templates are JSX' })
    const reactivity = allTabs.filter({ hasText: 'State changes re-render the component' })
    const unsynced = allTabs.first()

    await templates.getByRole('tab', { name: 'Svelte' }).click()
    await expect(reactivity.getByRole('tab', { name: 'Svelte' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(unsynced.getByRole('tab', { name: 'React' })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    // A tab the second one doesn't have: it stays where it was
    await templates.getByRole('tab', { name: 'Vue' }).click()
    await expect(reactivity.getByRole('tab', { name: 'Svelte' })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    await page.reload()
    await expect(templates.getByRole('tab', { name: 'Vue' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('without localStorage, tabs of the same syncKey still switch together', async ({ page }) => {
    // localStorage blocked, e.g. by the browser's settings: nothing can be stored
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException('Blocked', 'SecurityError')
      }
    })
    await page.goto('/authoring/tabs')
    await page.waitForLoadState('networkidle')

    const allTabs = page.locator('[data-slot="tabs"]')
    const templates = allTabs.filter({ hasText: 'Templates are JSX' })
    const reactivity = allTabs.filter({ hasText: 'State changes re-render the component' })

    // Only not remembered: the other `Tabs` of the page still follow
    await templates.getByRole('tab', { name: 'Svelte' }).click()
    await expect(templates.getByRole('tab', { name: 'Svelte' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(reactivity.getByRole('tab', { name: 'Svelte' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('a stored pick a tabs has no tab for leaves it on its defaultValue', async ({ page }) => {
    // Vue, picked on another page: the second `Tabs` of `syncKey="framework"` has no Vue tab
    await page.addInitScript(() => {
      localStorage.setItem('pmndrs-docs:tabs:framework', 'vue')
    })
    await page.goto('/authoring/tabs')
    await page.waitForLoadState('networkidle')

    const allTabs = page.locator('[data-slot="tabs"]')
    const templates = allTabs.filter({ hasText: 'Templates are JSX' })
    const reactivity = allTabs.filter({ hasText: 'State changes re-render the component' })

    await expect(templates.getByRole('tab', { name: 'Vue' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(reactivity.getByRole('tab', { name: 'React' })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    // Still stored, for the next `Tabs` that has it
    expect(await page.evaluate(() => localStorage.getItem('pmndrs-docs:tabs:framework'))).toBe(
      'vue',
    )
  })
})

//
// Primary color: the reader's pick re-seeds the palette, and is remembered
//

test.describe('primary color', () => {
  test.use({ disableAutoSnapshot: true })

  test('a picked color re-seeds the palette, is remembered, and resets', async ({ page }) => {
    const hydrationErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() !== 'error') return
      // The development message, and the production one (minified React errors 418 to 425)
      if (/hydrat|Minified React error #4(1[89]|2[0-5])/i.test(message.text())) {
        hydrationErrors.push(message.text())
      }
    })

    await page.goto('/getting-started/introduction')
    await page.waitForLoadState('networkidle')

    // The palette `Mtb` writes, seeded with the site's default (`toHaveText` doesn't read a
    // `<style>`'s text)
    const palette = () => page.locator('style#mcu-styles').textContent()
    const defaultPalette = await palette()
    // The palette in effect, whichever `<style>` it comes from
    const primary = () =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--md-sys-color-primary'),
      )
    const defaultPrimary = await primary()
    const swatch = page.getByRole('button', { name: 'Theme color' }).locator('span')
    const defaultSwatch = await swatch.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    )

    // The page as first painted: the HTML and its inline scripts, React never running
    const chunks = '**/_next/static/chunks/**'
    async function reloadWithoutReact() {
      await page.route(chunks, (route) => route.abort())
      await page.reload()
    }
    async function reloadWithReact() {
      await page.unroute(chunks)
      await page.reload()
      await page.waitForLoadState('networkidle')
    }

    await page.locator('input[type="color"]').fill('#ff0000')
    await expect.poll(palette).not.toBe(defaultPalette)
    const pickedPalette = await palette()
    const pickedPrimary = await primary()
    expect(pickedPrimary).not.toBe(defaultPrimary)
    expect(await page.evaluate(() => localStorage.getItem('pmndrs-docs:primary-color'))).toBe(
      '#ff0000',
    )

    await page.reload()
    await expect.poll(palette).toBe(pickedPalette)

    // The pick from the first paint, the swatch included: no flash of the default palette
    await reloadWithoutReact()
    expect(await palette()).toBe(defaultPalette) // the server's, React didn't replace it
    expect(await primary()).toBe(pickedPrimary)
    await expect(swatch).toHaveCSS('background-color', 'rgb(255, 0, 0)')

    await reloadWithReact()
    await expect.poll(palette).toBe(pickedPalette)
    // Once `Mtb` has the pick, only its palette is left
    await expect(page.locator('style#primary-color-prepaint')).toHaveCount(0)
    expect(await primary()).toBe(pickedPrimary)

    await page.getByRole('button', { name: 'Reset the theme color' }).click()
    await expect.poll(palette).toBe(defaultPalette)
    await expect(page.getByRole('button', { name: 'Reset the theme color' })).toBeHidden()
    expect(await page.evaluate(() => localStorage.getItem('pmndrs-docs:primary-color'))).toBeNull()

    // Reset, the default from the first paint again
    await reloadWithoutReact()
    expect(await primary()).toBe(defaultPrimary)
    await expect(swatch).toHaveCSS('background-color', defaultSwatch)

    await page.unroute(chunks)
    expect(hydrationErrors).toEqual([])
  })
})

//
// Theme: light, dark or the system's, picked from the header and remembered
//

test.describe('theme', () => {
  test.use({ disableAutoSnapshot: true })

  test('the toggle cycles system, light and dark, is remembered, and follows the system', async ({
    page,
  }) => {
    const hydrationErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() !== 'error') return
      // The development message, and the production one (minified React errors 418 to 425)
      if (/hydrat|Minified React error #4(1[89]|2[0-5])/i.test(message.text())) {
        hydrationErrors.push(message.text())
      }
    })

    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/getting-started/introduction')
    await page.waitForLoadState('networkidle')

    const html = page.locator('html')
    const toggle = page.getByRole('button', { name: /^Theme(:|$)/ })
    const storedTheme = () => page.evaluate(() => localStorage.getItem('theme'))

    // Nothing picked: the system's
    await expect(toggle).toHaveAccessibleName('Theme: system, switch to light')
    await expect(html).toHaveClass(/\blight\b/)
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(html).toHaveClass(/\bdark\b/)

    // Picked: whatever the system's
    await toggle.click()
    await expect(toggle).toHaveAccessibleName('Theme: light, switch to dark')
    await expect(html).toHaveClass(/\blight\b/)
    await expect(html).not.toHaveClass(/\bdark\b/)
    expect(await storedTheme()).toBe('light')

    await toggle.click()
    await expect(toggle).toHaveAccessibleName('Theme: dark, switch to system')
    await expect(html).toHaveClass(/\bdark\b/)
    expect(await storedTheme()).toBe('dark')
    await page.emulateMedia({ colorScheme: 'light' })
    await expect(html).toHaveClass(/\bdark\b/)

    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(toggle).toHaveAccessibleName('Theme: dark, switch to system')
    await expect(html).toHaveClass(/\bdark\b/)

    // The page as first painted, React never running: the stored theme's icon already, no swap.
    // The JS chunks only: the CSS ones hide the other icons
    const chunks = /\/_next\/static\/chunks\/.*\.js(\?|$)/
    await page.route(chunks, (route) => route.abort())
    await page.reload()
    await expect(html).toHaveClass(/\bdark\b/)
    await expect(toggle.locator('.lucide-moon')).toBeVisible()
    await expect(toggle.locator('.lucide-sun')).toBeHidden()
    await expect(toggle.locator('.lucide-monitor')).toBeHidden()
    await page.unroute(chunks)
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Back to the system's, which it follows again
    await toggle.click()
    await expect(toggle).toHaveAccessibleName('Theme: system, switch to light')
    expect(await storedTheme()).toBe('system')
    await expect(html).toHaveClass(/\blight\b/)
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(html).toHaveClass(/\bdark\b/)
    // Once hydrated, the button shows the theme itself
    await expect(html).not.toHaveAttribute('data-prepaint-theme')

    expect(hydrationErrors).toEqual([])
  })
})
