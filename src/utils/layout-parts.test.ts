import { describe, expect, it } from 'vitest'
import { readLayoutParts } from './layout-parts'

describe('readLayoutParts', () => {
  it('shows both parts by default', () => {
    expect(readLayoutParts({})).toEqual({ sponsorCard: true, libsMenu: true })
    // Empty: an input the reusable workflow's caller left out
    expect(readLayoutParts({ SPONSOR_CARD: '', LIBS_MENU: '' })).toEqual({
      sponsorCard: true,
      libsMenu: true,
    })
  })

  it('hides each part on `false`, on its own', () => {
    expect(readLayoutParts({ SPONSOR_CARD: 'false' })).toEqual({
      sponsorCard: false,
      libsMenu: true,
    })
    expect(readLayoutParts({ LIBS_MENU: 'false' })).toEqual({ sponsorCard: true, libsMenu: false })
    expect(readLayoutParts({ SPONSOR_CARD: 'true', LIBS_MENU: 'true' })).toEqual({
      sponsorCard: true,
      libsMenu: true,
    })
  })

  it('throws on anything else, naming the variable', () => {
    expect(() => readLayoutParts({ SPONSOR_CARD: 'no' })).toThrow(
      'SPONSOR_CARD: "no" is not `true` or `false`',
    )
    expect(() => readLayoutParts({ LIBS_MENU: '0' })).toThrow('LIBS_MENU: "0"')
  })
})
