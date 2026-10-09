import { afterEach, describe, expect, it, vi } from 'vitest'

// `docsMtb` reads the environment when its module loads: a fresh copy for each one
async function loadDocsMtb(env: Record<string, string>) {
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value)
  vi.resetModules()
  return (await import('./mtb')).docsMtb
}

const names = (colors: { name: string }[]) => colors.map((color) => color.name)

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('docsMtb custom colours', () => {
  it('are the seven brand colours, then the five alerts, then the site’s own', async () => {
    const docsMtb = await loadDocsMtb({ THEME_CUSTOM_COLORS: 'brand:#ff2d95' })

    expect(names(docsMtb.customColors)).toEqual([
      'lime',
      'teal',
      'cyan',
      'purple',
      'red',
      'orange',
      'yellow',
      'note',
      'tip',
      'important',
      'warning',
      'caution',
      'brand',
    ])
  })

  it('let the site redefine a brand colour, after the alerts', async () => {
    const docsMtb = await loadDocsMtb({ THEME_CUSTOM_COLORS: 'lime:#00ff00' })

    const colors = names(docsMtb.customColors)
    expect(colors.filter((name) => name === 'lime')).toHaveLength(1)
    expect(colors.slice(-6)).toEqual(['note', 'tip', 'important', 'warning', 'caution', 'lime'])
  })

  it('refuse an alert, pointing to its THEME_<NAME>', async () => {
    await expect(loadDocsMtb({ THEME_CUSTOM_COLORS: 'note:#00ff00' })).rejects.toThrow(
      '"note" is a built-in color, set THEME_NOTE instead',
    )
  })

  it('take an alert’s THEME_<NAME> override', async () => {
    const docsMtb = await loadDocsMtb({ THEME_NOTE: '#00ff00' })

    expect(docsMtb.customColors.find((color) => color.name === 'note')?.hex).toBe('#00ff00')
  })
})
