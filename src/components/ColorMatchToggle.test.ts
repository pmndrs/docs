import { describe, expect, it, vi } from 'vitest'
import { prepaintScript } from './ColorMatchToggle'
import { PREPAINT_OVERRIDDEN_ATTRIBUTES } from './ThemeControlButton'
import { COLOR_MATCH_KEY } from '@/hooks/useColorMatch'

const ATTRIBUTE = 'data-prepaint-color-match'
const OVERRIDDEN = PREPAINT_OVERRIDDEN_ATTRIBUTES.colorMatch

// Runs the script as the browser would, against a `localStorage` and a `document` stub
function run(defaultColorMatch: boolean, stored: Record<string, string> | 'throws') {
  const localStorage = {
    getItem: (key: string) => {
      if (stored === 'throws') throw new Error('localStorage unavailable')
      return stored[key] ?? null
    },
  }
  const setAttribute = vi.fn()
  const document = { documentElement: { setAttribute } }
  new Function('localStorage', 'document', prepaintScript(defaultColorMatch))(
    localStorage,
    document,
  )
  return Object.fromEntries(setAttribute.mock.calls)
}

describe('ColorMatchToggle prepaint', () => {
  it('shows the default when nothing is stored', () => {
    const attributes = run(false, {})
    expect(attributes[ATTRIBUTE]).toBe('off')
    expect(attributes).not.toHaveProperty(OVERRIDDEN)
  })

  it('shows the stored pick, overriding the default', () => {
    const attributes = run(false, { [COLOR_MATCH_KEY]: 'true' })
    expect(attributes[ATTRIBUTE]).toBe('on')
    expect(attributes[OVERRIDDEN]).toBe('')
  })

  it('overrides a site that matches by default too', () => {
    const attributes = run(true, { [COLOR_MATCH_KEY]: 'false' })
    expect(attributes[ATTRIBUTE]).toBe('off')
    expect(attributes[OVERRIDDEN]).toBe('')
  })

  it('is not overridden when the stored pick is the default', () => {
    const attributes = run(false, { [COLOR_MATCH_KEY]: 'false' })
    expect(attributes[ATTRIBUTE]).toBe('off')
    expect(attributes).not.toHaveProperty(OVERRIDDEN)
  })

  it('falls back to the default on an invalid stored value', () => {
    const attributes = run(false, { [COLOR_MATCH_KEY]: 'yes' })
    expect(attributes[ATTRIBUTE]).toBe('off')
    expect(attributes).not.toHaveProperty(OVERRIDDEN)
  })

  it('falls back to the default when localStorage throws', () => {
    const attributes = run(true, 'throws')
    expect(attributes[ATTRIBUTE]).toBe('on')
    expect(attributes).not.toHaveProperty(OVERRIDDEN)
  })
})
