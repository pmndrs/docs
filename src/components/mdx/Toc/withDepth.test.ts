import { describe, expect, it } from 'vitest'
import { withDepth } from './withDepth'

// `level` is the heading number - 1 (see rehypeToc): h2 is 1, h3 is 2, h4 is 3
const h2 = (title: string) => ({ title, level: 1 })
const h3 = (title: string) => ({ title, level: 2 })
const h4 = (title: string) => ({ title, level: 3 })

const depths = (headings: { title: string; level: number }[]) =>
  withDepth(headings).map(({ title, depth }) => [title, depth])

describe('withDepth', () => {
  it('gives flat h2s depth 1', () => {
    expect(depths([h2('a'), h2('b'), h2('c')])).toEqual([
      ['a', 1],
      ['b', 1],
      ['c', 1],
    ])
  })

  it('nests an h3 under its h2', () => {
    expect(depths([h2('a'), h3('a.1'), h3('a.2'), h2('b')])).toEqual([
      ['a', 1],
      ['a.1', 2],
      ['a.2', 2],
      ['b', 1],
    ])
  })

  it('nests an h4 directly under an h2 at depth 2, not 3', () => {
    expect(depths([h2('a'), h4('a.1'), h2('b')])).toEqual([
      ['a', 1],
      ['a.1', 2],
      ['b', 1],
    ])
  })

  it('gives an h3 before any h2 depth 1', () => {
    expect(depths([h3('intro'), h2('a'), h3('a.1')])).toEqual([
      ['intro', 1],
      ['a', 1],
      ['a.1', 2],
    ])
  })

  it('keeps the other fields', () => {
    expect(withDepth([{ id: 'a', level: 1 }])).toEqual([{ id: 'a', level: 1, depth: 1 }])
  })
})
