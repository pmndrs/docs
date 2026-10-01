import { describe, expect, it } from 'vitest'
import { deploymentUrl, parseBranches, withoutTrailingSlash } from './version'

describe('parseBranches', () => {
  it('reads a JSON array of branch names', () => {
    expect(parseBranches('["main","feat/switcher"]')).toEqual(['main', 'feat/switcher'])
  })

  it('gives an empty list for anything else', () => {
    expect(parseBranches(undefined)).toEqual([])
    expect(parseBranches('')).toEqual([])
    expect(parseBranches('main,next')).toEqual([])
    expect(parseBranches('{"main":true}')).toEqual([])
  })

  it('drops the entries that are not branch names', () => {
    expect(parseBranches('["main",1,null,"",{"a":1},"next"]')).toEqual(['main', 'next'])
  })
})

describe('withoutTrailingSlash', () => {
  it('strips the trailing slashes', () => {
    expect(withoutTrailingSlash('https://docs.pmnd.rs/')).toBe('https://docs.pmnd.rs')
    expect(withoutTrailingSlash('https://example.com/drei//')).toBe('https://example.com/drei')
  })

  it('leaves a URL without one as is', () => {
    expect(withoutTrailingSlash('https://docs.pmnd.rs')).toBe('https://docs.pmnd.rs')
  })
})

describe('deploymentUrl', () => {
  const config = {
    urlTemplate: 'https://docs-git-{branch}-pmndrs.vercel.app',
    productionBranch: 'main',
    productionUrl: 'https://docs.pmnd.rs/',
  }

  it('goes to the production URL for the production branch', async () => {
    expect(await deploymentUrl('main', config)).toBe('https://docs.pmnd.rs')
  })

  it('expands the URL template for any other branch', async () => {
    expect(await deploymentUrl('feat/switcher', config)).toBe(
      'https://docs-git-feat-switcher-pmndrs.vercel.app',
    )
  })

  it('expands the template for the production branch too when its URL is unknown', async () => {
    expect(await deploymentUrl('main', { ...config, productionUrl: undefined })).toBe(
      'https://docs-git-main-pmndrs.vercel.app',
    )
  })

  it('keeps the base path the URL carries', async () => {
    expect(
      await deploymentUrl('feat/a', {
        ...config,
        urlTemplate: 'https://example.com/{branch}/drei/',
      }),
    ).toBe('https://example.com/feat-a/drei')
  })
})
