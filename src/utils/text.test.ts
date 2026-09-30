import { describe, it, expect } from 'vitest'
import { excerpt } from './text'

describe('excerpt', () => {
  const filler = 'lorem ipsum dolor sit amet '.repeat(4) // 108 chars

  it('keeps the text whole when the match is near the start', () => {
    expect(excerpt('the canvas renders', 'canvas')).toBe('the canvas renders')
  })

  it('keeps the text whole when there is no match, or no target', () => {
    expect(excerpt(filler, 'canvas')).toBe(filler)
    expect(excerpt(filler, '')).toBe(filler)
  })

  it('starts on a word boundary shortly before a later match', () => {
    // The match is at 112, so the cut lands at 52, in "amet", and moves on to the next word
    expect(excerpt(`${filler}the Canvas renders`, 'canvas')).toBe(
      '…lorem ipsum dolor sit amet lorem ipsum dolor sit amet the Canvas renders',
    )
  })

  it('cuts mid-word when no space comes before the match', () => {
    const text = `${'x'.repeat(100)}canvas`
    expect(excerpt(text, 'canvas')).toBe(`…${'x'.repeat(60)}canvas`)
  })
})
