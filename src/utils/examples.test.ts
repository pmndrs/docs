import { describe, it, expect } from 'vitest'
import { assertExampleName, exampleUrl, indexUrl } from './examples'

/**
 * The rendering these used to cover now lives in pmndrs/examples, which
 * publishes the documents this server passes on (`test/render.test.ts` there).
 * What is left is the part that belongs to a server taking a name from a model:
 * that name reaches a URL only if it is the shape a published example has.
 */

describe('assertExampleName', () => {
  it('passes the shape every published example has', () => {
    expect(assertExampleName('gltfjsx-400kb-drone')).toBe('gltfjsx-400kb-drone')
  })

  it.each([
    '../../etc/passwd',
    'caustics/../index',
    'caustics?x=1',
    'caustics#fragment',
    'Caustics',
    'a b',
    '',
  ])('rejects %j before it can reach a URL', (name) => {
    expect(() => assertExampleName(name)).toThrow(/Not an example name/)
  })

  it('no longer has to reserve "index"', () => {
    // It used to collide with the catalog's own index, which sat in the same
    // directory. The index is `/llms.txt` now, so this is just a name with no
    // example behind it -- and 404 says that better than a special case.
    expect(assertExampleName('index')).toBe('index')
    expect(exampleUrl('index')).toBe('https://pmndrs.github.io/examples/examples/index.md')
  })
})

describe('exampleUrl', () => {
  it("is the example page's URL with .md on the end", () => {
    expect(exampleUrl('caustics')).toBe('https://pmndrs.github.io/examples/examples/caustics.md')
  })

  it('follows a local build when one is given', () => {
    expect(exampleUrl('caustics', 'http://localhost:3001')).toBe(
      'http://localhost:3001/examples/caustics.md',
    )
  })
})

describe('indexUrl', () => {
  it('is the root convention, not a page sibling', () => {
    expect(indexUrl()).toBe('https://pmndrs.github.io/examples/llms.txt')
  })
})
