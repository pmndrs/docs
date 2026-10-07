import { describe, expect, it, vi } from 'vitest'
import { prepaintScript } from './SchemeToggle'
import { PREPAINT_OVERRIDDEN_ATTRIBUTES } from './ThemeControlButton'
import { SCHEME_KEY } from '@/hooks/useScheme'

const ATTRIBUTE = 'data-prepaint-scheme'
const OVERRIDDEN = PREPAINT_OVERRIDDEN_ATTRIBUTES.scheme

// Runs the script as the browser would, against a `localStorage` and a `document` stub
function run(defaultScheme: string, stored: Record<string, string> | 'throws') {
  const localStorage = {
    getItem: (key: string) => {
      if (stored === 'throws') throw new Error('localStorage unavailable')
      return stored[key] ?? null
    },
  }
  const setAttribute = vi.fn()
  const document = { documentElement: { setAttribute } }
  new Function('localStorage', 'document', prepaintScript(defaultScheme))(localStorage, document)
  return Object.fromEntries(setAttribute.mock.calls)
}

describe('SchemeToggle prepaint', () => {
  it('shows the default when nothing is stored', () => {
    const attributes = run('tonalSpot', {})
    expect(attributes[ATTRIBUTE]).toBe('tonalSpot')
    expect(attributes).not.toHaveProperty(OVERRIDDEN)
  })

  it('shows the stored scheme, overriding the default', () => {
    const attributes = run('tonalSpot', { [SCHEME_KEY]: 'vibrant' })
    expect(attributes[ATTRIBUTE]).toBe('vibrant')
    expect(attributes[OVERRIDDEN]).toBe('')
  })

  it('is not overridden when the stored scheme is the default', () => {
    const attributes = run('tonalSpot', { [SCHEME_KEY]: 'tonalSpot' })
    expect(attributes[ATTRIBUTE]).toBe('tonalSpot')
    expect(attributes).not.toHaveProperty(OVERRIDDEN)
  })

  it('falls back to the default on an unknown stored value', () => {
    const attributes = run('tonalSpot', { [SCHEME_KEY]: 'rainbow' })
    expect(attributes[ATTRIBUTE]).toBe('tonalSpot')
    expect(attributes).not.toHaveProperty(OVERRIDDEN)
  })

  it('falls back to the default when localStorage throws', () => {
    const attributes = run('tonalSpot', 'throws')
    expect(attributes[ATTRIBUTE]).toBe('tonalSpot')
    expect(attributes).not.toHaveProperty(OVERRIDDEN)
  })
})
