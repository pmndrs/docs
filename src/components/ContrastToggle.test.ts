import { describe, expect, it, vi } from 'vitest'
import { prepaintScript } from './ContrastToggle'
import { PREPAINT_OVERRIDDEN_ATTRIBUTES } from './ThemeControlButton'
import { CONTRAST_LEVEL_KEY } from '@/hooks/useContrastLevel'

const ATTRIBUTE = 'data-prepaint-contrast'
const OVERRIDDEN = PREPAINT_OVERRIDDEN_ATTRIBUTES.contrast

// Runs the script as the browser would, against a `localStorage` and a `document` stub
function run(defaultLevelName: string, stored: Record<string, string> | 'throws') {
  const localStorage = {
    getItem: (key: string) => {
      if (stored === 'throws') throw new Error('localStorage unavailable')
      return stored[key] ?? null
    },
  }
  const setAttribute = vi.fn()
  const document = { documentElement: { setAttribute } }
  new Function('localStorage', 'document', prepaintScript(defaultLevelName))(localStorage, document)
  return Object.fromEntries(setAttribute.mock.calls)
}

describe('ContrastToggle prepaint', () => {
  it('shows the default when nothing is stored', () => {
    const attributes = run('standard', {})
    expect(attributes[ATTRIBUTE]).toBe('standard')
    expect(attributes).not.toHaveProperty(OVERRIDDEN)
  })

  it('shows the stored level, overriding the default', () => {
    const attributes = run('standard', { [CONTRAST_LEVEL_KEY]: '1' })
    expect(attributes[ATTRIBUTE]).toBe('high')
    expect(attributes[OVERRIDDEN]).toBe('')
  })

  it('is not overridden when the stored level is the default', () => {
    const attributes = run('standard', { [CONTRAST_LEVEL_KEY]: '0' })
    expect(attributes[ATTRIBUTE]).toBe('standard')
    expect(attributes).not.toHaveProperty(OVERRIDDEN)
  })

  it('falls back to the default on an invalid stored value', () => {
    const attributes = run('standard', { [CONTRAST_LEVEL_KEY]: 'loud' })
    expect(attributes[ATTRIBUTE]).toBe('standard')
    expect(attributes).not.toHaveProperty(OVERRIDDEN)
  })

  it('falls back to the default when localStorage throws', () => {
    const attributes = run('standard', 'throws')
    expect(attributes[ATTRIBUTE]).toBe('standard')
    expect(attributes).not.toHaveProperty(OVERRIDDEN)
  })
})
