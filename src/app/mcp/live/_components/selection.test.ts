import { describe, expect, it } from 'vitest'
import type { McpEvent } from './event'
import { formatSelection, graphMode, isSelected, parseSelection, toggleLib } from './selection'

const event = (lib?: string) => ({ lib }) as McpEvent

describe('graphMode', () => {
  it('shows an overview of every library when none is selected', () => {
    expect(graphMode([])).toEqual({ kind: 'overview' })
  })

  it('re-roots on a single library', () => {
    expect(graphMode(['drei'])).toEqual({ kind: 'rooted', lib: 'drei' })
  })

  it('shows the pages of two or three', () => {
    expect(graphMode(['drei', 'uikit'])).toEqual({ kind: 'pages', libs: ['drei', 'uikit'] })
    expect(graphMode(['drei', 'uikit', 'xr'])).toMatchObject({ kind: 'pages' })
  })

  it('falls back to the overview past three', () => {
    expect(graphMode(['drei', 'uikit', 'xr', 'leva'])).toEqual({ kind: 'overview' })
  })
})

describe('isSelected', () => {
  it('keeps everything, library or not, when none is selected', () => {
    expect(isSelected(event('drei'), [])).toBe(true)
    expect(isSelected(event(), [])).toBe(true)
  })

  it('keeps only the selected libraries otherwise', () => {
    expect(isSelected(event('drei'), ['drei', 'uikit'])).toBe(true)
    expect(isSelected(event('zustand'), ['drei', 'uikit'])).toBe(false)
    expect(isSelected(event(), ['drei'])).toBe(false)
  })
})

describe('toggleLib', () => {
  it('adds, then removes', () => {
    expect(toggleLib([], 'drei')).toEqual(['drei'])
    expect(toggleLib(['drei'], 'uikit')).toEqual(['drei', 'uikit'])
    expect(toggleLib(['drei', 'uikit'], 'drei')).toEqual(['uikit'])
  })
})

describe('URL parameter', () => {
  it('reads a comma-separated list, and a single library as before', () => {
    expect(parseSelection('drei')).toEqual(['drei'])
    expect(parseSelection('drei,uikit')).toEqual(['drei', 'uikit'])
    expect(parseSelection(' drei, ,uikit,drei ')).toEqual(['drei', 'uikit'])
    expect(parseSelection('')).toEqual([])
    expect(parseSelection(null)).toEqual([])
  })

  it('writes one back, or nothing for none', () => {
    expect(formatSelection(['drei', 'uikit'])).toBe('drei,uikit')
    expect(formatSelection([])).toBeUndefined()
  })
})
