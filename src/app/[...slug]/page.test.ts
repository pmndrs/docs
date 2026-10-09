import { pmndrsMtb } from '@/lib/md3'
import { test, expect } from '@chromatic-com/playwright'
import type { Locator, Page } from '@playwright/test'
import { builder } from 'material-theme-builder'

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

// `toHaveScreenshot` never compares against a baseline (see `updateSnapshots` in
// playwright.config.ts): it waits for a settled page. Chromatic, which captures at the end of
// the test, holds the baselines
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
// Links: underlined in the prose, not told apart by colour alone (WCAG 1.4.1) — a palette can bring
// `primary` within a hair of the body text. The headings' self-links are not
//

test.describe('links', () => {
  test.use({ disableAutoSnapshot: true })

  test('a link in the prose is underlined, a heading self-link is not', async ({ page }) => {
    await page.goto('/getting-started/introduction')
    await page.waitForLoadState('networkidle')

    const article = page.getByRole('article')
    // Not a `Badge`: a link too, in the page's first paragraph, but a chip, not prose
    const proseLink = article
      .getByRole('paragraph')
      .getByRole('link')
      .and(page.locator(':not([data-slot="badge"])'))
      .first()
    const headingLink = article
      .getByRole('link')
      .filter({ has: page.getByRole('heading') })
      .first()

    await expect(proseLink).toHaveCSS('text-decoration-line', 'underline')
    await expect(headingLink).toHaveCSS('text-decoration-line', 'none')
  })
})

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

// The theme controls are in the TOC column from `xl`, at the foot of the sidebar below, and in its
// sheet below `lg`: opened here, as a reader would, once React runs (a reload closes it)
async function showThemeControls(page: Page) {
  const sidebarTrigger = page.getByRole('button', { name: 'Toggle Sidebar' })
  if (!(await sidebarTrigger.isVisible())) return
  await sidebarTrigger.click()
  // Slid in: the controls are where they stay
  await page
    .getByRole('dialog')
    .evaluate((sheet) =>
      Promise.all(sheet.getAnimations({ subtree: true }).map((animation) => animation.finished)),
    )
}

// The page before React runs shows no sheet: there, the server-rendered copies are checked on their
// computed style, whether their column shows at this width or not
function anyCopy(page: Page, name: string | RegExp) {
  return page.getByRole('button', { name, includeHidden: true }).first()
}

// The palette `Mtb` writes (`toHaveText` doesn't read a `<style>`'s text)
function palette(page: Page) {
  return page.locator('style#mcu-styles').textContent()
}

// The palette in effect, whichever `<style>` it comes from
function primary(page: Page) {
  return page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--md-sys-color-primary'),
  )
}

// The palette cached once applied, for the next load: the seeds it was built from
function cache(page: Page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem('pmndrs-docs:primary-color:css') ?? 'null'),
  )
}

// The page as first painted: the HTML and its inline scripts, React never running. The JS chunks
// only: the CSS ones hide the other icons
const chunks = /\/_next\/static\/chunks\/.*\.js(\?|$)/
async function reloadWithoutReact(page: Page) {
  await page.route(chunks, (route) => route.abort())
  await page.reload()
}
async function reloadWithReact(page: Page) {
  await page.unroute(chunks)
  await page.reload()
  await page.waitForLoadState('networkidle')
  await showThemeControls(page)
}

function collectHydrationErrors(page: Page) {
  const hydrationErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    // The development message, and the production one (minified React errors 418 to 425)
    if (/hydrat|Minified React error #4(1[89]|2[0-5])/i.test(message.text())) {
      hydrationErrors.push(message.text())
    }
  })
  return hydrationErrors
}

// What a theme control's accessible name ends with once the reader overrode its seed
const RESET_HINT = ', double-click or Delete to reset'

test.describe('primary color', () => {
  test.use({ disableAutoSnapshot: true })

  test('a picked color re-seeds the palette, is remembered, and forgotten for the default', async ({
    page,
  }) => {
    const hydrationErrors = collectHydrationErrors(page)

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
    const swatch = anyCopy(page, 'Theme color').locator('span')
    const defaultSwatch = await swatch.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    )
    const input = page.locator('input[type="color"]').filter({ visible: true })
    const button = page.getByRole('button', { name: 'Theme color' })
    const html = page.locator('html')

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

    await showThemeControls(page)

    // The native picker opens where its input is: over the swatch's button, for it to open under
    const inputBox = await input.boundingBox()
    const buttonBox = await button.boundingBox()
    expect(inputBox && buttonBox).toBeTruthy()
    expect(inputBox!.x).toBeGreaterThanOrEqual(buttonBox!.x)
    expect(inputBox!.y).toBeGreaterThanOrEqual(buttonBox!.y)
    expect(inputBox!.x + inputBox!.width).toBeLessThanOrEqual(buttonBox!.x + buttonBox!.width)
    expect(inputBox!.y + inputBox!.height).toBeLessThanOrEqual(buttonBox!.y + buttonBox!.height)

    // Nothing picked: the site's default, the swatch not outlined
    await expect(button).toHaveAccessibleName('Theme color')
    await expect(button).not.toHaveAttribute('data-overridden')

    await input.fill('#ff0000')
    await expect.poll(palette).not.toBe(defaultPalette)
    const pickedPalette = await palette()
    const pickedPrimary = await primary()
    expect(pickedPrimary).not.toBe(defaultPrimary)
    expect(await page.evaluate(() => localStorage.getItem('pmndrs-docs:primary-color'))).toBe(
      '#ff0000',
    )
    // Overriding the default: the swatch says so
    await expect(button).toHaveAccessibleName(`Theme color${RESET_HINT}`)
    await expect(button).toHaveAttribute('data-overridden', '')

    await page.reload()
    await expect.poll(palette).toBe(pickedPalette)
    // Cached once the color has settled, for the next load
    await expect
      .poll(() =>
        page.evaluate(
          () => JSON.parse(localStorage.getItem('pmndrs-docs:primary-color:css') ?? 'null')?.color,
        ),
      )
      .toBe('#ff0000')

    // The pick from the first paint, the swatch included: no flash of the default palette
    await reloadWithoutReact()
    expect(await palette()).toBe(defaultPalette) // the server's, React didn't replace it
    expect(await primary()).toBe(pickedPrimary)
    await expect(swatch).toHaveCSS('background-color', 'rgb(255, 0, 0)')
    // Overriding the default, from the first paint too
    await expect(html).toHaveAttribute('data-prepaint-primary-color-overridden', '')

    await reloadWithReact()
    await expect.poll(palette).toBe(pickedPalette)
    // Once `Mtb` has the pick, only its palette is left
    await expect(page.locator('style#primary-color-prepaint')).toHaveCount(0)
    expect(await primary()).toBe(pickedPrimary)
    // Once hydrated, the swatch says it itself
    await expect(html).not.toHaveAttribute('data-prepaint-primary-color-overridden')
    await showThemeControls(page)
    await expect(button).toHaveAttribute('data-overridden', '')

    // A double-click forgets the pick, and its palette
    await button.dblclick()
    await expect(button).toHaveAccessibleName('Theme color')
    await expect(button).not.toHaveAttribute('data-overridden')
    await expect.poll(palette).toBe(defaultPalette)
    expect(await page.evaluate(() => localStorage.getItem('pmndrs-docs:primary-color'))).toBeNull()

    // Picking the site's default (`THEME_PRIMARY`, unset: the pmndrs lime) forgets the pick too,
    // and its palette
    await input.fill('#ff0000')
    await expect.poll(palette).toBe(pickedPalette)
    await expect(button).toHaveAttribute('data-overridden', '')
    await input.fill('#caf543')
    await expect(button).toHaveAccessibleName('Theme color')
    await expect(button).not.toHaveAttribute('data-overridden')
    await expect.poll(palette).toBe(defaultPalette)
    expect(await page.evaluate(() => localStorage.getItem('pmndrs-docs:primary-color'))).toBeNull()
    expect(
      await page.evaluate(() => localStorage.getItem('pmndrs-docs:primary-color:css')),
    ).toBeNull()

    // Forgotten, the default from the first paint again
    await reloadWithoutReact()
    expect(await primary()).toBe(defaultPrimary)
    await expect(swatch).toHaveCSS('background-color', defaultSwatch)
    await expect(html).not.toHaveAttribute('data-prepaint-primary-color-overridden')

    await page.unroute(chunks)
    expect(hydrationErrors).toEqual([])
  })
})

//
// Contrast: the reader's level reshapes the palette, and is remembered
//

test.describe('contrast', () => {
  test.use({ disableAutoSnapshot: true })

  test('the toggle cycles standard, medium and high, is remembered, and forgotten for the default', async ({
    page,
  }) => {
    const hydrationErrors = collectHydrationErrors(page)

    await page.goto('/getting-started/introduction')
    await page.waitForLoadState('networkidle')

    const defaultPalette = await palette(page)
    const defaultPrimary = await primary(page)
    const storedLevel = () =>
      page.evaluate(() => localStorage.getItem('pmndrs-docs:contrast-level'))

    const name = /^Contrast(:|$)/
    const toggle = page.getByRole('button', { name })
    const html = page.locator('html')

    await showThemeControls(page)

    // Nothing picked: the site's default (`THEME_CONTRAST`, unset: standard), the button not
    // outlined
    await expect(toggle).toHaveAccessibleName('Contrast: standard, switch to medium')
    await expect(toggle).not.toHaveAttribute('data-overridden')

    // Overriding the default: the button says so
    await toggle.click()
    await expect(toggle).toHaveAccessibleName(`Contrast: medium, switch to high${RESET_HINT}`)
    await expect(toggle).toHaveAttribute('data-overridden', '')
    await expect.poll(() => palette(page)).not.toBe(defaultPalette)
    const mediumPalette = await palette(page)
    expect(await storedLevel()).toBe('0.5')

    await toggle.click()
    await expect(toggle).toHaveAccessibleName(`Contrast: high, switch to standard${RESET_HINT}`)
    await expect.poll(() => palette(page)).not.toBe(mediumPalette)
    const highPalette = await palette(page)
    const highPrimary = await primary(page)
    expect(highPrimary).not.toBe(defaultPrimary)
    expect(await storedLevel()).toBe('1')

    await reloadWithReact(page)
    await expect.poll(() => palette(page)).toBe(highPalette)
    await expect(toggle).toHaveAccessibleName(`Contrast: high, switch to standard${RESET_HINT}`)
    // Cached once applied, for the next load: the default color, at this level
    await expect.poll(async () => (await cache(page))?.contrast).toBe(1)
    expect((await cache(page))?.color).toBe('#CAF543')

    // The level from the first paint, its icon included: no flash of the default palette
    await reloadWithoutReact(page)
    expect(await palette(page)).toBe(defaultPalette) // the server's, React didn't replace it
    expect(await primary(page)).toBe(highPrimary)
    await expect(anyCopy(page, name).locator('.lucide-contrast.size-6')).toHaveCSS(
      'display',
      'block',
    )
    await expect(anyCopy(page, name).locator('.lucide-contrast.size-4')).toHaveCSS(
      'display',
      'none',
    )
    await expect(anyCopy(page, name).locator('.lucide-contrast.size-5')).toHaveCSS(
      'display',
      'none',
    )
    // Overriding the default, from the first paint too
    await expect(html).toHaveAttribute('data-prepaint-contrast-overridden', '')

    await reloadWithReact(page)
    await expect.poll(() => palette(page)).toBe(highPalette)
    // Once `Mtb` has the level, only its palette is left
    await expect(page.locator('style#primary-color-prepaint')).toHaveCount(0)
    // Once hydrated, the button shows the level, and says it overrides the default, itself
    await expect(html).not.toHaveAttribute('data-prepaint-contrast')
    await expect(html).not.toHaveAttribute('data-prepaint-contrast-overridden')
    await expect(toggle).toHaveAttribute('data-overridden', '')

    // With a picked color too: the cache is the palette of both
    await page.locator('input[type="color"]').filter({ visible: true }).fill('#ff0000')
    await expect
      .poll(async () => {
        const { color, contrast } = (await cache(page)) ?? {}
        return { color, contrast }
      })
      .toEqual({ color: '#ff0000', contrast: 1 })
    const pickedPrimary = await primary(page)
    await reloadWithoutReact(page)
    expect(await primary(page)).toBe(pickedPrimary)
    await reloadWithReact(page)
    await page.locator('input[type="color"]').filter({ visible: true }).fill('#caf543')
    await expect.poll(async () => (await cache(page))?.color).toBe('#CAF543')

    // Back to the site's default: forgotten, and its palette with it
    await toggle.click()
    await expect(toggle).toHaveAccessibleName('Contrast: standard, switch to medium')
    await expect(toggle).not.toHaveAttribute('data-overridden')
    await expect.poll(() => palette(page)).toBe(defaultPalette)
    expect(await storedLevel()).toBeNull()
    expect(await cache(page)).toBeNull()

    // A double-click, from any level: the default too, forgotten (its first click is a step, to
    // high here, its second one is not)
    await toggle.click()
    await expect(toggle).toHaveAttribute('data-overridden', '')
    await toggle.dblclick()
    await expect(toggle).toHaveAccessibleName('Contrast: standard, switch to medium')
    await expect(toggle).not.toHaveAttribute('data-overridden')
    await expect.poll(() => palette(page)).toBe(defaultPalette)
    expect(await storedLevel()).toBeNull()
    expect(await cache(page)).toBeNull()

    // Delete on the focused button, the same, without a mouse
    await toggle.click()
    await expect(toggle).toHaveAttribute('data-overridden', '')
    await toggle.focus()
    await page.keyboard.press('Delete')
    await expect(toggle).toHaveAccessibleName('Contrast: standard, switch to medium')
    await expect(toggle).not.toHaveAttribute('data-overridden')
    expect(await storedLevel()).toBeNull()

    // Forgotten, the default from the first paint again
    await reloadWithoutReact(page)
    expect(await primary(page)).toBe(defaultPrimary)
    await expect(anyCopy(page, name).locator('.lucide-contrast.size-4')).toHaveCSS(
      'display',
      'block',
    )
    await expect(html).not.toHaveAttribute('data-prepaint-contrast-overridden')

    await page.unroute(chunks)
    expect(hydrationErrors).toEqual([])
  })
})

//
// Scheme: the reader's Material scheme reshapes the palette, and is remembered
//

test.describe('scheme', () => {
  test.use({ disableAutoSnapshot: true })

  test('the toggle cycles every scheme, composes with the contrast, is remembered, and forgotten for the default', async ({
    page,
  }) => {
    const hydrationErrors = collectHydrationErrors(page)

    await page.goto('/getting-started/introduction')
    await page.waitForLoadState('networkidle')

    const defaultPalette = await palette(page)
    const storedScheme = () => page.evaluate(() => localStorage.getItem('pmndrs-docs:scheme'))

    const name = /^Scheme(:|$)/
    const toggle = page.getByRole('button', { name })
    const colorMatchToggle = page.getByRole('button', { name: /^Color match(:|$)/ })
    const html = page.locator('html')

    await showThemeControls(page)

    // Color match is on by default, and takes precedence over the scheme (no toggle while it is
    // on): the reader turns it off first, and the site's default scheme, tonal spot, applies
    await colorMatchToggle.click()
    await expect(colorMatchToggle).toHaveAccessibleName(
      `Color match: off, switch to on${RESET_HINT}`,
    )
    await expect.poll(() => palette(page)).not.toBe(defaultPalette)
    const tonalSpotPalette = (await palette(page))!
    const tonalSpotPrimary = await primary(page)

    // Nothing picked: the site's default (`THEME_SCHEME`, unset: tonal spot), then every other one,
    // each its own palette
    const schemes = [
      ['tonal spot', 'tonalSpot'],
      ['vibrant', 'vibrant'],
      ['expressive', 'expressive'],
      ['fidelity', 'fidelity'],
      ['content', 'content'],
      ['monochrome', 'monochrome'],
      ['neutral', 'neutral'],
    ]
    await expect(toggle).toHaveAccessibleName('Scheme: tonal spot, switch to vibrant')
    await expect(toggle).not.toHaveAttribute('data-overridden')
    let previousPalette = tonalSpotPalette
    for (let i = 1; i < schemes.length; i++) {
      const [label, value] = schemes[i]
      const [nextLabel] = schemes[(i + 1) % schemes.length]
      await toggle.click()
      // Overriding the default: the button says so
      await expect(toggle).toHaveAccessibleName(
        `Scheme: ${label}, switch to ${nextLabel}${RESET_HINT}`,
      )
      await expect(toggle).toHaveAttribute('data-overridden', '')
      await expect.poll(() => palette(page)).not.toBe(previousPalette)
      previousPalette = (await palette(page))!
      expect(await storedScheme()).toBe(value)
    }

    // Round to the default, forgotten, then vibrant again
    await toggle.click()
    await expect(toggle).toHaveAccessibleName('Scheme: tonal spot, switch to vibrant')
    await expect(toggle).not.toHaveAttribute('data-overridden')
    await expect.poll(() => palette(page)).toBe(tonalSpotPalette)
    expect(await storedScheme()).toBeNull()
    await toggle.click()
    await expect(toggle).toHaveAccessibleName(`Scheme: vibrant, switch to expressive${RESET_HINT}`)
    await expect.poll(() => palette(page)).not.toBe(tonalSpotPalette)
    const vibrantPalette = await palette(page)
    const vibrantPrimary = await primary(page)
    expect(vibrantPrimary).not.toBe(tonalSpotPrimary)

    await reloadWithReact(page)
    await expect.poll(() => palette(page)).toBe(vibrantPalette)
    await expect(toggle).toHaveAccessibleName(`Scheme: vibrant, switch to expressive${RESET_HINT}`)
    // Cached once applied, for the next load: the default color and contrast, color match off, in
    // this scheme
    await expect.poll(async () => (await cache(page))?.scheme).toBe('vibrant')
    expect((await cache(page))?.color).toBe('#CAF543')
    expect((await cache(page))?.contrast).toBe(0)
    expect((await cache(page))?.colorMatch).toBe(false)

    // The scheme from the first paint, its icon included: no flash of the default palette
    await reloadWithoutReact(page)
    expect(await palette(page)).toBe(defaultPalette) // the server's, React didn't replace it
    expect(await primary(page)).toBe(vibrantPrimary)
    await expect(anyCopy(page, name).locator('.lucide-sparkles')).toHaveCSS('display', 'block')
    await expect(anyCopy(page, name).locator('.lucide-palette')).toHaveCSS('display', 'none')
    // Overriding the default, from the first paint too
    await expect(html).toHaveAttribute('data-prepaint-scheme-overridden', '')

    await reloadWithReact(page)
    await expect.poll(() => palette(page)).toBe(vibrantPalette)
    // Once `Mtb` has the scheme, only its palette is left
    await expect(page.locator('style#primary-color-prepaint')).toHaveCount(0)
    // Once hydrated, the button shows the scheme, and says it overrides the default, itself
    await expect(html).not.toHaveAttribute('data-prepaint-scheme')
    await expect(html).not.toHaveAttribute('data-prepaint-scheme-overridden')
    await expect(toggle).toHaveAttribute('data-overridden', '')

    // With a contrast too: the palette of both, cached as such
    const contrastToggle = page.getByRole('button', { name: /^Contrast(:|$)/ })
    await contrastToggle.click()
    await contrastToggle.click()
    await expect(contrastToggle).toHaveAccessibleName(
      `Contrast: high, switch to standard${RESET_HINT}`,
    )
    await expect.poll(() => palette(page)).not.toBe(vibrantPalette)
    await expect
      .poll(async () => {
        const { contrast, scheme } = (await cache(page)) ?? {}
        return { contrast, scheme }
      })
      .toEqual({ contrast: 1, scheme: 'vibrant' })
    const bothPrimary = await primary(page)
    await reloadWithoutReact(page)
    expect(await primary(page)).toBe(bothPrimary)
    await reloadWithReact(page)
    await contrastToggle.click()
    await expect(contrastToggle).toHaveAccessibleName('Contrast: standard, switch to medium')
    await expect.poll(async () => (await cache(page))?.contrast).toBe(0)

    // Back to the site's default with a double-click, from vibrant: forgotten, and its palette with
    // it (its first click is a step, to expressive, its second one is not)
    await toggle.dblclick()
    await expect(toggle).toHaveAccessibleName('Scheme: tonal spot, switch to vibrant')
    await expect(toggle).not.toHaveAttribute('data-overridden')
    await expect.poll(() => palette(page)).toBe(tonalSpotPalette)
    expect(await storedScheme()).toBeNull()
    // Color match is still the reader's: cached, in the default scheme
    await expect.poll(async () => (await cache(page))?.scheme).toBe('tonalSpot')

    // Forgotten, the default scheme from the first paint again
    await reloadWithoutReact(page)
    expect(await primary(page)).toBe(tonalSpotPrimary)
    await expect(anyCopy(page, name).locator('.lucide-palette')).toHaveCSS('display', 'block')
    await expect(html).not.toHaveAttribute('data-prepaint-scheme-overridden')

    // Color match back to the site's default too: nothing picked, nothing cached
    await reloadWithReact(page)
    await colorMatchToggle.dblclick()
    await expect(colorMatchToggle).toHaveAccessibleName('Color match: on, switch to off')
    await expect.poll(() => palette(page)).toBe(defaultPalette)
    expect(await cache(page)).toBeNull()

    await page.unroute(chunks)
    expect(hydrationErrors).toEqual([])
  })
})

//
// Color match: the palette true to the seed color, the site's default, and the reader's to turn off
//

test.describe('color match', () => {
  test.use({ disableAutoSnapshot: true })

  test('the toggle flips off and on, is remembered, and forgotten for the default', async ({
    page,
  }) => {
    const hydrationErrors = collectHydrationErrors(page)

    await page.goto('/getting-started/introduction')
    await page.waitForLoadState('networkidle')

    const defaultPalette = await palette(page)
    const defaultPrimary = await primary(page)
    const stored = () => page.evaluate(() => localStorage.getItem('pmndrs-docs:color-match'))

    const name = /^Color match(:|$)/
    const toggle = page.getByRole('button', { name })
    const html = page.locator('html')

    await showThemeControls(page)

    // Nothing picked: the site's default (`THEME_COLOR_MATCH`, unset: on), the button not outlined
    await expect(toggle).toHaveAccessibleName('Color match: on, switch to off')
    await expect(toggle).not.toHaveAttribute('data-overridden')

    // Overriding the default: the button says so, the palette is toned down to the scheme
    await toggle.click()
    await expect(toggle).toHaveAccessibleName(`Color match: off, switch to on${RESET_HINT}`)
    await expect(toggle).toHaveAttribute('data-overridden', '')
    await expect.poll(() => palette(page)).not.toBe(defaultPalette)
    const unmatchedPalette = await palette(page)
    const unmatchedPrimary = await primary(page)
    expect(unmatchedPrimary).not.toBe(defaultPrimary)
    expect(await stored()).toBe('false')

    await reloadWithReact(page)
    await expect.poll(() => palette(page)).toBe(unmatchedPalette)
    await expect(toggle).toHaveAccessibleName(`Color match: off, switch to on${RESET_HINT}`)
    // Cached once applied, for the next load: the default color, contrast and scheme, unmatched
    await expect.poll(async () => (await cache(page))?.colorMatch).toBe(false)
    expect((await cache(page))?.color).toBe('#CAF543')

    // The pick from the first paint, its icon included: no flash of the default palette
    await reloadWithoutReact(page)
    expect(await palette(page)).toBe(defaultPalette) // the server's, React didn't replace it
    expect(await primary(page)).toBe(unmatchedPrimary)
    await expect(anyCopy(page, name).locator('.lucide-blend')).toHaveCSS('display', 'block')
    await expect(anyCopy(page, name).locator('.lucide-pipette')).toHaveCSS('display', 'none')
    // Overriding the default, from the first paint too
    await expect(html).toHaveAttribute('data-prepaint-color-match-overridden', '')

    await reloadWithReact(page)
    await expect.poll(() => palette(page)).toBe(unmatchedPalette)
    // Once `Mtb` has the pick, only its palette is left
    await expect(page.locator('style#primary-color-prepaint')).toHaveCount(0)
    // Once hydrated, the button shows the pick, and says it overrides the default, itself
    await expect(html).not.toHaveAttribute('data-prepaint-color-match')
    await expect(html).not.toHaveAttribute('data-prepaint-color-match-overridden')
    await expect(toggle).toHaveAttribute('data-overridden', '')

    // Back to the site's default with a double-click: forgotten, and its palette with it (its
    // first click is a step, to on, its second one is not)
    await toggle.dblclick()
    await expect(toggle).toHaveAccessibleName('Color match: on, switch to off')
    await expect(toggle).not.toHaveAttribute('data-overridden')
    await expect.poll(() => palette(page)).toBe(defaultPalette)
    expect(await stored()).toBeNull()
    expect(await cache(page)).toBeNull()

    // Flipping back to the site's default forgets the pick too
    await toggle.click()
    await expect(toggle).toHaveAttribute('data-overridden', '')
    await toggle.click()
    await expect(toggle).toHaveAccessibleName('Color match: on, switch to off')
    await expect(toggle).not.toHaveAttribute('data-overridden')
    expect(await stored()).toBeNull()

    // Forgotten, the default from the first paint again
    await reloadWithoutReact(page)
    expect(await primary(page)).toBe(defaultPrimary)
    await expect(anyCopy(page, name).locator('.lucide-pipette')).toHaveCSS('display', 'block')
    await expect(html).not.toHaveAttribute('data-prepaint-color-match-overridden')

    await page.unroute(chunks)
    expect(hydrationErrors).toEqual([])
  })

  test('while on, the scheme toggle is hidden, from the first paint', async ({ page }) => {
    const hydrationErrors = collectHydrationErrors(page)

    await page.goto('/getting-started/introduction')
    await page.waitForLoadState('networkidle')

    const toggle = page.getByRole('button', { name: /^Color match(:|$)/ })
    const schemeName = /^Scheme(:|$)/
    const schemeToggle = page.getByRole('button', { name: schemeName })
    // Every copy, hidden or not
    const schemeToggles = page.getByRole('button', { name: schemeName, includeHidden: true })
    const html = page.locator('html')

    await showThemeControls(page)

    // On, the site's default: not in the page, `colorMatch` taking precedence over `scheme` in
    // material-theme-builder
    await expect(toggle).not.toHaveAttribute('data-overridden')
    await expect(schemeToggles).toHaveCount(0)

    // From the first paint too: the server-rendered button is there, the pre-paint attribute hides it
    await reloadWithoutReact(page)
    await expect(html).toHaveAttribute('data-prepaint-color-match', 'on')
    await expect(anyCopy(page, schemeName)).toHaveCSS('display', 'none')

    // Off: the scheme toggle is there
    await reloadWithReact(page)
    await toggle.click()
    await expect(toggle).toHaveAttribute('data-overridden', '')
    await expect(schemeToggle).toBeVisible()

    // From the first paint too, the pick remembered
    await reloadWithoutReact(page)
    await expect(html).toHaveAttribute('data-prepaint-color-match', 'off')
    await expect(anyCopy(page, schemeName)).not.toHaveCSS('display', 'none')

    // On again: not in the page, hydrated and from the first paint
    await reloadWithReact(page)
    await expect(schemeToggle).toBeVisible()
    await toggle.click()
    await expect(toggle).not.toHaveAttribute('data-overridden')
    await expect(schemeToggles).toHaveCount(0)
    await reloadWithoutReact(page)
    await expect(html).toHaveAttribute('data-prepaint-color-match', 'on')
    await expect(anyCopy(page, schemeName)).toHaveCSS('display', 'none')

    await page.unroute(chunks)
    expect(hydrationErrors).toEqual([])
  })
})

//
// Theme: light, dark or the system's, picked by the reader and remembered
//

test.describe('theme', () => {
  test.use({ disableAutoSnapshot: true })

  test('the toggle cycles system, light and dark, is remembered, and follows the system', async ({
    page,
  }) => {
    const hydrationErrors = collectHydrationErrors(page)

    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/getting-started/introduction')
    await page.waitForLoadState('networkidle')
    await showThemeControls(page)

    const html = page.locator('html')
    const name = /^Theme(:|$)/
    const toggle = page.getByRole('button', { name })
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
    await showThemeControls(page)
    await expect(toggle).toHaveAccessibleName('Theme: dark, switch to system')
    await expect(html).toHaveClass(/\bdark\b/)

    // The page as first painted, React never running: the stored theme's icon already, no swap
    await page.route(chunks, (route) => route.abort())
    await page.reload()
    await expect(html).toHaveClass(/\bdark\b/)
    await expect(anyCopy(page, name).locator('.lucide-moon')).toHaveCSS('display', 'block')
    await expect(anyCopy(page, name).locator('.lucide-sun')).toHaveCSS('display', 'none')
    await expect(anyCopy(page, name).locator('.lucide-monitor')).toHaveCSS('display', 'none')
    await page.unroute(chunks)
    await page.reload()
    await page.waitForLoadState('networkidle')
    await showThemeControls(page)

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

//
// Radius: the corners a reader sees are the design system's, the luma preset's scale
// (pmndrs/design-system's own preset, `b1VlIttI`): every step a multiple of `--radius`
//

test.describe('radius', () => {
  test.use({ disableAutoSnapshot: true })

  test("the corners follow the design-system preset's radius scale", async ({ page }) => {
    await page.goto('/getting-started/introduction')
    await page.waitForLoadState('networkidle')

    // What a reader's browser computes, through what the stylesheet actually ships, rather than the
    // `--radius-*` variables: Tailwind only emits the theme variables it finds named in the sources,
    // and with `@theme inline` it writes their values into the utilities instead, so which of them
    // a page declares depends on what some file happens to name (Sandpack.css, a story's sample
    // CSS), not on its corners.
    // Not a `rounded-*` probe for every step either: Tailwind only generates the utilities the
    // sources use, and nothing uses `rounded-sm` as a class. So each step is read off a probe that
    // the site's own CSS styles with it: a `<mark>` (`@apply rounded-sm` in globals.css) for `sm`,
    // the `rounded-*` utility, which the ui/ components use, for the others. A step that loses its
    // last user fails here rather than passing on a 0px probe.
    // The expected pixels are the spec: the 17px root makes the 0.625rem base 10.625px, times
    // luma's factor
    const expected = {
      sm: 6.375, // ×0.6
      md: 8.5, // ×0.8
      lg: 10.625, // ×1
      xl: 14.875, // ×1.4
      '2xl': 19.125, // ×1.8
      '3xl': 23.375, // ×2.2
      '4xl': 27.625, // ×2.6
    }
    const computed = await page.evaluate((steps) => {
      return Object.fromEntries(
        steps.map((step) => {
          const probe = document.createElement(step === 'sm' ? 'mark' : 'div')
          if (step !== 'sm') probe.className = `rounded-${step}`
          document.body.append(probe)
          const value = parseFloat(getComputedStyle(probe).borderTopLeftRadius)
          probe.remove()
          return [step, value]
        }),
      )
    }, Object.keys(expected))

    for (const [step, px] of Object.entries(expected)) {
      expect(computed[step], `--radius-${step}`).toBeCloseTo(px, 2)
    }
  })
})

//
// Fonts: Inter from the luma preset as `--font-sans`, Inconsolata from pmndrs/design-system's
// `font-mono` item as `--font-mono`, both through `next/font/google`. Read off what a reader's
// browser computes, not off the stylesheet: the family names `next/font` writes are its own
// business, so each assertion only asks which typeface comes first.
//

test.describe('fonts', () => {
  test.use({ disableAutoSnapshot: true })

  test('code is set in Inconsolata, the prose in Inter', async ({ page }) => {
    await page.goto('/authoring/code')
    await page.waitForLoadState('networkidle')

    const article = page.getByRole('article')
    // The first family is the one asked for. Inconsolata's fallback is the generic monospace
    // (`src/lib/fonts.ts`), so code stays monospace before the font loads or if it fails to; Inter's is
    // `next/font`'s metric-matched face
    const inconsolata = /^"?Inconsolata"?,.*\bmonospace$/
    const inter = /^"?Inter"?,/

    await expect(article.locator('pre').first()).toHaveCSS('font-family', inconsolata)
    await expect(article.getByRole('paragraph').locator('code').first()).toHaveCSS(
      'font-family',
      inconsolata,
    )

    await expect(page.locator('body')).toHaveCSS('font-family', inter)
    // `font-mono` styles `code, kbd, samp, pre` without a class: a selector any broader would turn
    // the prose monospace, which this paragraph, with no code in it, would show
    const paragraph = article
      .getByRole('paragraph')
      .filter({ hasNot: page.locator('code') })
      .first()
    await expect(paragraph).toHaveCSS('font-family', inter)
    await expect(paragraph).not.toHaveCSS('font-family', /Inconsolata|monospace/)
  })
})

//
// Docs-only colours: the components whose colours the site picks itself (rather than through a
// `ui/` component) draw them from the MD3 roles. Read off what a reader's browser computes, against
// the role resolved in the same page
//

// The colour a reader's browser computes for `value` (a role's `var()`), in the format of a computed
// `color` or `background-color`
function resolveColor(page: Page, value: string) {
  return page.evaluate((value) => {
    const probe = document.createElement('div')
    probe.style.color = value
    document.body.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  }, value)
}

// The background a reader sees behind an element: its own, or its nearest ancestor's that has one
function backdrop(locator: Locator) {
  return locator.evaluate((element) => {
    for (let node: Element | null = element; node; node = node.parentElement) {
      const background = getComputedStyle(node).backgroundColor
      if (background !== 'rgba(0, 0, 0, 0)') return background
    }
    return null
  })
}

const alerts = ['note', 'tip', 'important', 'warning', 'caution']

// The roles the design system's palette makes of its alert colours (`src/lib/md3.ts`, a verbatim
// copy of `md3-base`), which no `THEME_*` here overrides
const designSystemPalette = builder(pmndrsMtb.source, pmndrsMtb)
const hex = (argb: number) => `#${(argb & 0xffffff).toString(16).padStart(6, '0')}`

test.describe('docs-only colours', () => {
  test.use({ disableAutoSnapshot: true })

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`the alert roles are the design system's defaults, ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme })
      await page.goto('/authoring/gha')
      await page.waitForLoadState('networkidle')

      const colors =
        colorScheme === 'light'
          ? designSystemPalette.mergedColorsLight
          : designSystemPalette.mergedColorsDark
      for (const alert of alerts) {
        for (const [role, key] of [
          [alert, alert],
          [`${alert}-container`, `${alert}Container`],
        ]) {
          const value = await page.evaluate(
            (role) =>
              getComputedStyle(document.documentElement).getPropertyValue(`--md-sys-color-${role}`),
            role,
          )
          expect(value.toLowerCase(), role).toBe(hex(colors[key]))
        }
      }
    })
  }

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`a GitHub alert's text is in the on-container role of its background, ${colorScheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme })
      await page.goto('/authoring/gha')
      await page.waitForLoadState('networkidle')

      for (const alert of alerts) {
        const text = page
          .locator(`[data-slot="gha"][data-keyword="${alert}"]`)
          .first()
          .getByRole('paragraph')
          .first()
        await expect(text, alert).toHaveCSS(
          'color',
          await resolveColor(page, `var(--md-sys-color-on-${alert}-container)`),
        )
      }
    })
  }

  test("a link in a GitHub alert, a footnote ref included, is in the alert's text role", async ({
    page,
  }) => {
    // Not `networkidle`: the previews keep fetching from CodeSandbox. Its NOTE has a link, a TIP a
    // footnote ref
    await page.goto('/authoring/sandpack', { waitUntil: 'domcontentloaded' })

    const alertsWithLinks = page
      .locator('[data-slot="gha"]')
      .filter({ has: page.getByRole('link') })
    await expect(alertsWithLinks.first()).toBeVisible()
    for (const alert of await alertsWithLinks.all()) {
      const keyword = await alert.getAttribute('data-keyword')
      const expected = await resolveColor(page, `var(--md-sys-color-on-${keyword}-container)`)
      for (const link of await alert.getByRole('link').all()) {
        await expect(link, keyword!).toHaveCSS('color', expected)
      }
    }
  })

  test('a Sandpack editor is coloured like a code block', async ({ page }) => {
    await page.goto('/authoring/code')
    await page.waitForLoadState('networkidle')
    const codeKeyword = page.getByRole('article').locator('pre .token.keyword').first()
    const keywordColor = await codeKeyword.evaluate((element) => getComputedStyle(element).color)
    const codeBackground = await backdrop(codeKeyword)

    // Not `networkidle`: the previews keep fetching from CodeSandbox
    await page.goto('/authoring/sandpack', { waitUntil: 'domcontentloaded' })
    const sandpackKeyword = page.locator('.sp-code-editor .sp-syntax-keyword').first()

    await expect(sandpackKeyword).toHaveCSS('color', keywordColor)
    expect(await backdrop(sandpackKeyword)).toBe(codeBackground)
  })

  test('a Mermaid diagram is drawn in the palette, and follows the theme and the picked color', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/authoring/mermaid')
    await page.waitForLoadState('networkidle')

    // The flowchart's first node: Mermaid's `base` theme fills it with `primaryColor`
    const node = page.locator('[data-slot="mermaid"] .node rect').first()
    const primaryContainer = () => resolveColor(page, 'var(--md-sys-color-primary-container)')

    await expect(node).toHaveCSS('fill', await primaryContainer())

    // Through the theme toggle, as a reader switches: system (light), then light, then dark
    await showThemeControls(page)
    const toggle = page.getByRole('button', { name: /^Theme(:|$)/ })
    await toggle.click()
    await toggle.click()
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    const darkPrimaryContainer = await primaryContainer()
    await expect(node).toHaveCSS('fill', darkPrimaryContainer)

    // A picked color re-seeds the palette, and the diagram with it
    await page.locator('input[type="color"]').filter({ visible: true }).fill('#ff0000')
    await expect.poll(primaryContainer).not.toBe(darkPrimaryContainer)
    await expect(node).toHaveCSS('fill', await primaryContainer())
  })
})
