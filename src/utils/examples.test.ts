import { describe, it, expect } from 'vitest'
import { assertExampleName, catalogUrl } from './examples'

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

  it('rejects "index", which is the one name that collides with the catalog itself', () => {
    // Legal kebab-case, same directory: it would serve the index of the whole
    // gallery under the guise of a single example.
    expect(() => assertExampleName('index')).toThrow(/Not an example name/)
  })
})

describe('catalogUrl', () => {
  it('points at the markdown the gallery publishes, not the JSON beside it', () => {
    expect(catalogUrl('caustics')).toBe('https://pmndrs.github.io/examples/catalog/caustics.md')
  })

  it('follows a local build when one is given', () => {
    expect(catalogUrl('index', 'http://localhost:3001')).toBe(
      'http://localhost:3001/catalog/index.md',
    )
  })
})
