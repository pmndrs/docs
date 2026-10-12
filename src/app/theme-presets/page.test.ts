import { expect, test } from '@playwright/test'
import { builder } from 'material-theme-builder'

declare global {
  interface Window {
    presetLabels: string[]
  }
}

test.setTimeout(60000)

const presetPage = '/authoring/theme-seeds'
const surfaceInk = () =>
  getComputedStyle(document.documentElement).getPropertyValue('--md-sys-color-on-surface').trim()

function recordPresetFrames() {
  const view = window
  view.presetLabels = []
  function sample() {
    const button = document.querySelector('button[aria-label="Seed preset"]')
    if (button) view.presetLabels.push(button.textContent?.trim() ?? '')
    requestAnimationFrame(sample)
  }
  requestAnimationFrame(sample)
}

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

for (const preset of [
  { label: 'Purple', source: '#D855F9', neutral: undefined },
  { label: 'Lime', source: '#CAF543', neutral: '#c1b793' },
]) {
  test(`${preset.label} keeps its native neutral palette across navigation, contrast and reload`, async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'light'))
    await page.goto(presetPage)
    const selector = page.getByRole('button', { name: 'Seed preset', exact: true })
    await selector.click()
    await page.getByRole('menuitemradio', { name: preset.label, exact: true }).click()
    await expect(selector).toHaveText(preset.label)
    const ink = () => page.evaluate(surfaceInk)
    await expect.poll(ink).toBe(expectedSurfaceInk(preset.source, 0, preset.neutral))
    const introduction = page.getByRole('link', { name: 'getting started', exact: true })
    if (!(await introduction.isVisible())) {
      await page.getByRole('button', { name: 'Toggle Sidebar', exact: true }).click()
    }
    await introduction.click()
    await expect(page).toHaveURL(/\/getting-started\/introduction/)
    await page.getByRole('button', { name: /Contrast: standard, switch to medium/ }).click()
    await expect.poll(ink).toBe(expectedSurfaceInk(preset.source, 0.5, preset.neutral))
    await page.reload()
    await expect.poll(ink).toBe(expectedSurfaceInk(preset.source, 0.5, preset.neutral))
    await page.goto(presetPage)
    await expect(selector).toHaveText(preset.label)
    await expect.poll(ink).toBe(expectedSurfaceInk(preset.source, 0.5, preset.neutral))
    await selector.click()
    await page.getByRole('menuitemradio', { name: 'Lime', exact: true }).click()
    await expect.poll(ink).toBe(expectedSurfaceInk('#CAF543', 0.5, '#c1b793'))
    await expect(
      page.getByRole('button', { name: /Contrast: medium, switch to high/ }),
    ).toBeVisible()
  })
}

test('switches native Teal and Cyan presets without resetting the saved contrast', async ({
  page,
}) => {
  await page.addInitScript(recordPresetFrames)
  await page.addInitScript(() => localStorage.setItem('theme', 'light'))
  await page.goto(presetPage)
  const selector = page.getByRole('button', { name: 'Seed preset', exact: true })
  await selector.click()
  await page.getByRole('menuitemradio', { name: 'Teal', exact: true }).click()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: /Contrast: standard, switch to medium/ }).click()
  await expect.poll(() => page.evaluate(surfaceInk)).toBe(expectedSurfaceInk('#00F7A3', 0.5))
  await page.evaluate(() => {
    window.presetLabels = []
  })
  await selector.click()
  await page.getByRole('menuitemradio', { name: 'Cyan', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(selector).toHaveText('Cyan')
  await expect.poll(() => page.evaluate(surfaceInk)).toBe(expectedSurfaceInk('#2BDCF6', 0.5))
  const transitionLabels = await page.evaluate(() => window.presetLabels)
  expect(transitionLabels.every((label) => label === 'Teal' || label === 'Cyan')).toBe(true)
  await page.reload()
  await expect(selector).toHaveText('Cyan')
  await expect.poll(() => page.evaluate(surfaceInk)).toBe(expectedSurfaceInk('#2BDCF6', 0.5))
  const reloadLabels = await page.evaluate(() => window.presetLabels)
  expect(reloadLabels.length).toBeGreaterThan(0)
  expect(reloadLabels.every((label) => label === 'Cyan')).toBe(true)
  await expect(page.getByRole('button', { name: /Contrast: medium, switch to high/ })).toBeVisible()
})

test('recognizes a saved footer source and preserves custom footer colours', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'light')
    localStorage.setItem('pmndrs-docs:primary-color', '#d855f9')
    localStorage.setItem('pmndrs-docs:color-match', 'true')
  })
  await page.goto(presetPage)
  const selector = page.getByRole('button', { name: 'Seed preset', exact: true })
  await expect(selector).toHaveText('Purple')
  await expect.poll(() => page.evaluate(surfaceInk)).toBe(expectedSurfaceInk('#D855F9', 0))
  await page.locator('input[type="color"]').last().fill('#123456', { force: true })
  await expect(selector).toHaveText('Custom')
  await expect(page.getByRole('table', { name: 'Current theme seeds' })).toContainText('#123456')
  await expect
    .poll(() => page.evaluate(surfaceInk))
    .toBe(expectedSurfaceInk('#123456', 0, '#c1b793'))
})
