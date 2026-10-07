import { describe, expect, it } from 'vitest'
import { parseCustomColors } from './custom-colors'

describe('parseCustomColors', () => {
  it('reads `name:hex` entries, not blended unless `:blend` says so', () => {
    expect(parseCustomColors('brand:#ff2d95:blend,status:#17b26a')).toEqual([
      { name: 'brand', hex: '#ff2d95', blend: true },
      { name: 'status', hex: '#17b26a', blend: false },
    ])
  })

  it('separates the entries with commas, spaces or newlines, as a branch list', () => {
    expect(parseCustomColors(' brand:#f0f\n status:#17b26a, , ok:#17b26aff ')).toEqual([
      { name: 'brand', hex: '#f0f', blend: false },
      { name: 'status', hex: '#17b26a', blend: false },
      { name: 'ok', hex: '#17b26aff', blend: false },
    ])
  })

  it('gives an empty list for nothing', () => {
    expect(parseCustomColors()).toEqual([])
    expect(parseCustomColors('')).toEqual([])
    expect(parseCustomColors(' , ')).toEqual([])
  })

  it('throws on a malformed entry, naming it', () => {
    expect(() => parseCustomColors('brand')).toThrow('"brand" is not a `name:hex`')
    expect(() => parseCustomColors('brand:#f0f:blend:extra')).toThrow('"brand:#f0f:blend:extra"')
    expect(() => parseCustomColors('Brand:#f0f')).toThrow('"Brand" is not a kebab-case name')
    expect(() => parseCustomColors('brand:ff2d95')).toThrow('"ff2d95" of "brand" is not a hex')
    expect(() => parseCustomColors('brand:#ff2d9')).toThrow('"#ff2d9" of "brand" is not a hex')
    expect(() => parseCustomColors('brand:#f0f:true')).toThrow('"true" of "brand" is not `blend`')
  })

  it('throws on a name given twice', () => {
    expect(() => parseCustomColors('brand:#f0f,brand:#0f0')).toThrow('"brand" is given twice')
  })

  // The built-in colors are configured by their own variable: a second `note` here would
  // either shadow it or be shadowed, and whichever one wins, the other is a silent no-op
  it('throws on a built-in name, pointing at its THEME_* variable', () => {
    expect(() => parseCustomColors('note:#f0f', ['note', 'tip'])).toThrow(
      '"note" is a built-in color, set THEME_NOTE instead',
    )
    expect(parseCustomColors('brand:#f0f', ['note', 'tip'])).toEqual([
      { name: 'brand', hex: '#f0f', blend: false },
    ])
  })
})
