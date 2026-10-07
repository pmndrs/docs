import { describe, expect, it, vi } from 'vitest'
import { PRIMARY_COLOR_PREPAINT_VAR, prepaintScript } from './PrimaryColorPrepaint'
import { PREPAINT_OVERRIDDEN_ATTRIBUTES } from './ThemeControlButton'
import { PRIMARY_COLOR_KEY } from '@/hooks/usePrimaryColor'

const OVERRIDDEN = PREPAINT_OVERRIDDEN_ATTRIBUTES.primaryColor
const CACHE_KEY = `${PRIMARY_COLOR_KEY}:css`

const config = {
  signature: 'sig-1',
  defaultPrimaryColor: '#323e48',
  defaultContrastLevel: 0,
  defaultScheme: 'tonalSpot',
} as const

// Runs the script as the browser would, against a `localStorage` and a `document` stub
function run(stored: Record<string, string> | 'throws') {
  const localStorage = {
    getItem: (key: string) => {
      if (stored === 'throws') throw new Error('localStorage unavailable')
      return stored[key] ?? null
    },
  }
  const setAttribute = vi.fn()
  const setProperty = vi.fn()
  const style = { textContent: '' }
  const document = {
    documentElement: { setAttribute, style: { setProperty } },
    getElementById: vi.fn(() => style),
  }
  new Function('localStorage', 'document', prepaintScript(config))(localStorage, document)
  return {
    attributes: Object.fromEntries(setAttribute.mock.calls),
    properties: Object.fromEntries(setProperty.mock.calls),
    css: style.textContent,
  }
}

describe('PrimaryColorPrepaint prepaint', () => {
  it('sets the stored color, overriding the default', () => {
    const { attributes, properties } = run({ [PRIMARY_COLOR_KEY]: '#FF0000' })
    expect(properties[PRIMARY_COLOR_PREPAINT_VAR]).toBe('#FF0000')
    expect(attributes[OVERRIDDEN]).toBe('')
  })

  it('is not overridden when the stored color is the default, whatever its case', () => {
    const { attributes, properties } = run({ [PRIMARY_COLOR_KEY]: '#323E48' })
    expect(properties[PRIMARY_COLOR_PREPAINT_VAR]).toBe('#323E48')
    expect(attributes).not.toHaveProperty(OVERRIDDEN)
  })

  it('ignores an invalid stored color', () => {
    const { attributes, properties } = run({ [PRIMARY_COLOR_KEY]: 'red' })
    expect(properties).not.toHaveProperty(PRIMARY_COLOR_PREPAINT_VAR)
    expect(attributes).not.toHaveProperty(OVERRIDDEN)
  })

  it('sets nothing when localStorage throws', () => {
    const { attributes, properties, css } = run('throws')
    expect(properties).toEqual({})
    expect(attributes).toEqual({})
    expect(css).toBe('')
  })

  it('applies the cached palette made for the stored picks and this config', () => {
    const cache = {
      color: '#FF0000',
      contrast: config.defaultContrastLevel,
      scheme: config.defaultScheme,
      signature: config.signature,
      css: ':root { --md-sys-color-primary: red }',
    }
    const { css } = run({ [PRIMARY_COLOR_KEY]: '#FF0000', [CACHE_KEY]: JSON.stringify(cache) })
    expect(css).toBe(cache.css)
  })

  it('leaves a palette cached for another config alone', () => {
    const cache = {
      color: '#FF0000',
      contrast: config.defaultContrastLevel,
      scheme: config.defaultScheme,
      signature: 'sig-2',
      css: ':root { --md-sys-color-primary: red }',
    }
    const { css } = run({ [PRIMARY_COLOR_KEY]: '#FF0000', [CACHE_KEY]: JSON.stringify(cache) })
    expect(css).toBe('')
  })
})
