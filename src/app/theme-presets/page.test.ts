import { expect, test, type Page } from '@playwright/test'
import { builder } from 'material-theme-builder'

test.setTimeout(60000)

const surfaceInk = () =>
  getComputedStyle(document.documentElement).getPropertyValue('--md-sys-color-on-surface').trim()

function expectedSurfaceInk(source: string, contrast: number, neutral?: string) {
  const css = builder(source, {
    colorMatch: true,
    contrast,
    neutral,
    neutralVariant: neutral ? '#495720' : undefined,
    error: '#FF4980',
  }).toCss()
  const value = css.match(/--md-sys-color-on-surface:\s*([^;]+);/)![1].trim()
  const reference = value.match(/^var\(([^)]+)\)$/)
  return reference ? css.match(new RegExp(`${reference[1]}:\\s*([^;]+);`))![1].trim() : value
}

async function showThemeControls(page: Page) {
  const contrast = page.getByRole('button', { name: /^Contrast:/ })
  if (page.viewportSize()!.width < 1024 && !(await contrast.isVisible())) {
    await page.getByRole('button', { name: 'Toggle Sidebar', exact: true }).click()
  }
  await expect(contrast).toBeVisible()
}

for (const preset of [
  { label: 'Purple', source: '#D855F9', neutral: undefined },
  { label: 'Lime', source: '#CAF543', neutral: '#c1b793' },
]) {
  test(`${preset.label} stored seeds survive navigation, contrast and reload`, async ({ page }) => {
    await page.goto('/getting-started/introduction')
    // Seed once, as a consumer component would. Later reloads must use persisted choices.
    await page.evaluate(({ source, neutral }) => {
      localStorage.setItem('theme', 'light')
      localStorage.setItem('pmndrs-docs:primary-color', source)
      localStorage.setItem('pmndrs-docs:color-match', 'true')
      localStorage.setItem(
        'pmndrs-docs:source-preset',
        JSON.stringify({ source, neutral, neutralVariant: neutral ? '#495720' : undefined }),
      )
    }, preset)
    await page.reload()
    const ink = () => page.evaluate(surfaceInk)
    await expect.poll(ink).toBe(expectedSurfaceInk(preset.source, 0, preset.neutral))

    await page.getByRole('link', { name: 'reusable workflow', exact: true }).click()
    await expect(page).toHaveURL(/\/github-actions\/introduction/)
    await expect.poll(ink).toBe(expectedSurfaceInk(preset.source, 0, preset.neutral))
    await showThemeControls(page)
    await page.getByRole('button', { name: /Contrast: standard, switch to medium/ }).click()
    await expect.poll(ink).toBe(expectedSurfaceInk(preset.source, 0.5, preset.neutral))
    await page.reload()
    await expect.poll(ink).toBe(expectedSurfaceInk(preset.source, 0.5, preset.neutral))

    await showThemeControls(page)
    await expect(
      page.getByRole('button', { name: /Contrast: medium, switch to high/ }),
    ).toBeVisible()
    // A different footer source must stop applying the saved preset's neutral overrides.
    await page.locator('input[type="color"]').last().fill('#123456', { force: true })
    await expect.poll(ink).toBe(expectedSurfaceInk('#123456', 0.5, '#c1b793'))
    await page.reload()
    await expect.poll(ink).toBe(expectedSurfaceInk('#123456', 0.5, '#c1b793'))
    await showThemeControls(page)
    await page.locator('input[type="color"]').last().fill(preset.source, { force: true })
    await expect.poll(ink).toBe(expectedSurfaceInk(preset.source, 0.5, preset.neutral))
  })
}
