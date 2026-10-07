import { describe, expect, it } from 'vitest'
import { cliCommand, resolveLibKey } from './cliCommand'

describe('resolveLibKey', () => {
  it('matches the public URL against a library docs_url', () => {
    expect(resolveLibKey({ url: 'https://pmndrs.github.io/drei' })).toBe('drei')
  })

  it('ignores a trailing slash on the public URL', () => {
    expect(resolveLibKey({ url: 'https://pmndrs.github.io/zustand/' })).toBe('zustand')
  })

  it('matches the package homepage against the library with a relative docs_url', () => {
    expect(resolveLibKey({ url: 'https://docs.pmnd.rs' })).toBe('docs')
  })

  it('falls back to the last segment of the base path', () => {
    expect(resolveLibKey({ basePath: '/react-three-fiber' })).toBe('react-three-fiber')
    expect(resolveLibKey({ url: 'https://example.com/drei', basePath: '/drei' })).toBe('drei')
  })

  it('only knows libraries the CLI can read', () => {
    // `uikit` has no `llms_full`, so the CLI could not open it
    expect(resolveLibKey({ url: 'https://pmndrs.github.io/uikit/docs' })).toBeUndefined()
    expect(resolveLibKey({ basePath: '/uikit' })).toBeUndefined()
  })

  it('returns undefined when nothing matches', () => {
    expect(resolveLibKey({})).toBeUndefined()
    expect(resolveLibKey({ url: '', basePath: '' })).toBeUndefined()
    expect(resolveLibKey({ url: 'https://example.com', basePath: '/nope' })).toBeUndefined()
  })
})

describe('cliCommand', () => {
  it('prefixes the path with the library key', () => {
    expect(cliCommand('drei', '/loaders/gltf')).toBe('npx @pmndrs/docs drei/loaders/gltf')
  })

  it('uses the bare path without a library key', () => {
    expect(cliCommand(undefined, '/getting-started/introduction')).toBe(
      'npx @pmndrs/docs /getting-started/introduction',
    )
  })
})
