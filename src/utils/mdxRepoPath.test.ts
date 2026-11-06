import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mdxRepoPath } from './mdxRepoPath'

describe('mdxRepoPath', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('reads the MDX folder relative to its git repository', () => {
    vi.stubEnv('MDX', join(process.cwd(), 'docs'))
    expect(mdxRepoPath()).toBe('docs')
    vi.stubEnv('MDX', 'docs')
    expect(mdxRepoPath()).toBe('docs')
  })

  it('prefers the original MDX folder to the copy the CLI compiles', () => {
    vi.stubEnv('MDX', join(tmpdir(), 'copy'))
    vi.stubEnv('PMNDRS_MDX_SOURCE', join(process.cwd(), 'docs', 'authoring'))
    expect(mdxRepoPath()).toBe('docs/authoring')
  })

  it('falls back on the working directory out of a git repository', () => {
    const root = mkdtempSync(join(tmpdir(), 'mdx-repo-path-'))
    try {
      mkdirSync(join(root, 'docs'))
      vi.spyOn(process, 'cwd').mockReturnValue(root)
      vi.stubEnv('MDX', join(root, 'docs'))
      expect(mdxRepoPath()).toBe('docs')
      // Not under the working directory: unknown
      vi.stubEnv('MDX', tmpdir())
      expect(mdxRepoPath()).toBeUndefined()
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('is unknown without MDX', () => {
    vi.stubEnv('MDX', '')
    expect(mdxRepoPath()).toBeUndefined()
  })
})
