import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoFileUrl } from './rehypeRepoLink'

describe('repoFileUrl', () => {
  const base = 'https://github.com/pmndrs/docs/tree/main'
  // This checkout: its `.git` is the repository root
  const mdx = join(process.cwd(), 'docs')
  const file = join(mdx, 'authoring/introduction.mdx')

  it('links a file out of the MDX folder to the repository', () => {
    expect(repoFileUrl('../../src/components/mdx/index.tsx', file, mdx, base)).toBe(
      `${base}/src/components/mdx/index.tsx`,
    )
    expect(repoFileUrl('../../.github/workflows/build.yml#L172', file, mdx, base)).toBe(
      `${base}/.github/workflows/build.yml#L172`,
    )
    expect(repoFileUrl('../README.md', join(mdx, 'index.mdx'), mdx, base)).toBe(`${base}/README.md`)
  })

  it('leaves a link staying in the MDX folder as is', () => {
    for (const href of ['./img.mdx', 'img.mdx', '../getting-started/introduction', '..', '.']) {
      expect(repoFileUrl(href, file, mdx, base)).toBe(href)
    }
  })

  it('leaves an absolute, root-relative, protocol-relative or anchor link as is', () => {
    for (const href of [
      'https://example.com/a',
      'mailto:a@example.com',
      '//example.com/a',
      '/getting-started/introduction',
      '#configuration',
      '',
    ]) {
      expect(repoFileUrl(href, file, mdx, base)).toBe(href)
    }
  })

  it('leaves a link out of the repository as is', () => {
    expect(repoFileUrl('../../../../../../../../etc/hosts', file, mdx, base)).toBe(
      '../../../../../../../../etc/hosts',
    )
  })

  it('leaves the link as is without a base or an MDX folder', () => {
    expect(repoFileUrl('../../src/a.ts', file, mdx, undefined)).toBe('../../src/a.ts')
    expect(repoFileUrl('../../src/a.ts', file, mdx, '')).toBe('../../src/a.ts')
    expect(repoFileUrl('../../src/a.ts', file, undefined, base)).toBe('../../src/a.ts')
  })

  it('takes the nearest `package.json` as the root without a `.git`, as on Vercel', () => {
    const root = mkdtempSync(join(tmpdir(), 'repo-file-url-'))
    try {
      mkdirSync(join(root, 'docs/guide'), { recursive: true })
      writeFileSync(join(root, 'package.json'), '{}')
      expect(
        repoFileUrl('../../src/a.ts', join(root, 'docs/guide/page.mdx'), join(root, 'docs'), base),
      ).toBe(`${base}/src/a.ts`)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
