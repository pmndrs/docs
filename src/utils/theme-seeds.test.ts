import { describe, expect, it } from 'vitest'
import { parseThemeColor, parseThemeFlag, parseThemeSeed } from './theme-seeds'

describe('parseThemeColor', () => {
  it('reads a hex color of 3, 6 or 8 digits', () => {
    expect(parseThemeColor('NEUTRAL', '#c1b793')).toBe('#c1b793')
    expect(parseThemeColor('NEUTRAL', '#f0f')).toBe('#f0f')
    expect(parseThemeColor('NEUTRAL', '#C1B793FF')).toBe('#C1B793FF')
  })

  // The reusable workflow passes every input, set or not: an input left out arrives as ``
  it('gives undefined for nothing', () => {
    expect(parseThemeColor('NEUTRAL')).toBeUndefined()
    expect(parseThemeColor('NEUTRAL', '')).toBeUndefined()
  })

  it('throws on anything else, naming the variable', () => {
    expect(() => parseThemeColor('NEUTRAL_VARIANT', 'c1b793')).toThrow(
      'THEME_NEUTRAL_VARIANT: "c1b793" is not a hex color',
    )
    expect(() => parseThemeColor('ERROR', '#ff498')).toThrow('THEME_ERROR: "#ff498" is not a hex')
    expect(() => parseThemeColor('ERROR', 'red')).toThrow('THEME_ERROR: "red" is not a hex')
  })
})

describe('parseThemeFlag', () => {
  it('reads `true` and `false`', () => {
    expect(parseThemeFlag('COLOR_MATCH', 'true')).toBe(true)
    expect(parseThemeFlag('COLOR_MATCH', 'false')).toBe(false)
  })

  it('gives undefined for nothing', () => {
    expect(parseThemeFlag('COLOR_MATCH')).toBeUndefined()
    expect(parseThemeFlag('COLOR_MATCH', '')).toBeUndefined()
  })

  it('throws on anything else, naming the variable', () => {
    expect(() => parseThemeFlag('COLOR_MATCH', '1')).toThrow(
      'THEME_COLOR_MATCH: "1" is not `true` or `false`',
    )
    expect(() => parseThemeFlag('COLOR_MATCH', 'yes')).toThrow('THEME_COLOR_MATCH: "yes"')
  })
})

describe('parseThemeSeed', () => {
  it('gives the pmndrs seed for nothing', () => {
    expect(parseThemeSeed('NEUTRAL', undefined, '#c1b793')).toBe('#c1b793')
    expect(parseThemeSeed('NEUTRAL', '', '#c1b793')).toBe('#c1b793')
  })

  it('reads a hex color instead', () => {
    expect(parseThemeSeed('NEUTRAL', '#808080', '#c1b793')).toBe('#808080')
  })

  // No seed: material-theme-builder derives the color from the primary
  it('gives undefined for `auto`', () => {
    expect(parseThemeSeed('NEUTRAL', 'auto', '#c1b793')).toBeUndefined()
  })

  it('throws on anything else, naming the variable', () => {
    expect(() => parseThemeSeed('ERROR', 'red', '#FF4980')).toThrow(
      'THEME_ERROR: "red" is not a hex color (e.g. `#ff2d95`) or `auto`',
    )
    expect(() => parseThemeSeed('ERROR', 'Auto', '#FF4980')).toThrow('THEME_ERROR: "Auto"')
  })
})
