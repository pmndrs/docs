import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { originalPath } from './originalPath'

describe('originalPath', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('maps a file of the copy to the original', () => {
    vi.stubEnv('MDX', '/tmp/copy')
    vi.stubEnv('PMNDRS_MDX_SOURCE', '/repo/docs')
    expect(originalPath('/tmp/copy/guide/page.mdx')).toBe(join('/repo/docs', 'guide/page.mdx'))
    expect(originalPath('/tmp/copy/..drafts/page.mdx')).toBe(
      join('/repo/docs', '..drafts/page.mdx'),
    )
  })

  it('leaves a file out of the copy', () => {
    vi.stubEnv('MDX', '/tmp/copy')
    vi.stubEnv('PMNDRS_MDX_SOURCE', '/repo/docs')
    expect(originalPath('/tmp/other/page.mdx')).toBe('/tmp/other/page.mdx')
    expect(originalPath('/tmp/copy-2/page.mdx')).toBe('/tmp/copy-2/page.mdx')
  })

  it('leaves a file when the CLI compiles no copy', () => {
    vi.stubEnv('MDX', '/tmp/copy')
    vi.stubEnv('PMNDRS_MDX_SOURCE', undefined)
    expect(originalPath('/tmp/copy/page.mdx')).toBe('/tmp/copy/page.mdx')
  })
})
