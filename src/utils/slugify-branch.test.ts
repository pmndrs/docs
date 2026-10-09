import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import {
  assertValidUrlTemplate,
  expandUrlTemplate,
  genericBranchLabelPart,
  slugifyBranch,
  slugifyBranchVercel,
} from './slugify-branch'

describe('slugifyBranch', () => {
  it('lowercases and turns each run of other characters into one hyphen', () => {
    expect(slugifyBranch('main')).toBe('main')
    expect(slugifyBranch('feat/Sidebar_switcher')).toBe('feat-sidebar-switcher')
    expect(slugifyBranch('dependabot/npm_and_yarn/three-0.185.1')).toBe(
      'dependabot-npm-and-yarn-three-0-185-1',
    )
    expect(slugifyBranch('fix//a--b')).toBe('fix-a-b')
  })

  it('trims hyphens at both ends', () => {
    expect(slugifyBranch('/-feat/x_')).toBe('feat-x')
  })
})

describe('genericBranchLabelPart', () => {
  const prefix = 'design-system-git-'
  const suffix = '-pmndrs'

  it('is the plain slug when the label fits in 63 characters', async () => {
    expect(await genericBranchLabelPart('feat/Switcher', prefix, suffix)).toBe('feat-switcher')
    // 18 + 38 + 7 = 63: right at the limit
    const branch = 'a'.repeat(38)
    expect(await genericBranchLabelPart(branch, prefix, suffix)).toBe(branch)
  })

  it('truncates a long slug and appends the first 6 hex characters of sha256(branch)', async () => {
    // Real: this branch made a 64-character label, which Vercel refused as an alias
    const branch = 'claude/pages-shadcn-tailwind-prep-98d23c'
    const hash6 = createHash('sha256').update(branch).digest('hex').slice(0, 6)
    const part = await genericBranchLabelPart(branch, prefix, suffix)

    expect(part).toBe(`claude-pages-shadcn-tailwind-pr-${hash6}`)
    expect(`${prefix}${part}${suffix}`).toHaveLength(63)
  })

  it('drops the hyphens the cut leaves at the end of the slug', async () => {
    // 2 characters less room: the cut falls right after `tailwind-`
    const branch = 'claude/pages-shadcn-tailwind-prep-xyz'
    const hash6 = createHash('sha256').update(branch).digest('hex').slice(0, 6)
    expect(await genericBranchLabelPart(branch, `${prefix}xx`, suffix)).toBe(
      `claude-pages-shadcn-tailwind-${hash6}`,
    )
  })

  it('tells apart two long branches that share their beginning', async () => {
    const a = await genericBranchLabelPart(`feat/${'x'.repeat(60)}-a`, prefix, suffix)
    const b = await genericBranchLabelPart(`feat/${'x'.repeat(60)}-b`, prefix, suffix)
    expect(a).not.toBe(b)
  })

  it('throws when the rest of the label leaves no room for the hash', async () => {
    await expect(genericBranchLabelPart('feat/x', 'a'.repeat(60), '')).rejects.toThrow(
      '63-character',
    )
  })
})

describe('slugifyBranchVercel', () => {
  // Real branch URLs, as Vercel generated them
  it('replaces the first slash and deletes the other invalid characters', () => {
    expect(slugifyBranchVercel('fix/tests/some-more')).toBe('fix-testssome-more')
    expect(slugifyBranchVercel('dependabot/npm_and_yarn/three-0.185.1')).toBe(
      'dependabot-npmandyarnthree-01851',
    )
    expect(slugifyBranchVercel('v3_docs')).toBe('v3docs')
  })

  it('lowercases', () => {
    expect(slugifyBranchVercel('Feat/Switcher')).toBe('feat-switcher')
  })
})

describe('expandUrlTemplate', () => {
  it('uses the generic slug for {branch} and {branch:generic}', async () => {
    expect(
      await expandUrlTemplate('https://docs-git-{branch}-pmndrs.vercel.app', 'feat/Switcher'),
    ).toBe('https://docs-git-feat-switcher-pmndrs.vercel.app')
    expect(await expandUrlTemplate('https://{branch:generic}.example.com', 'feat/x')).toBe(
      'https://feat-x.example.com',
    )
  })

  it('keeps a {branch} hostname label within 63 characters', async () => {
    const url = await expandUrlTemplate(
      'https://design-system-git-{branch}-pmndrs.vercel.app/design-system',
      'claude/pages-shadcn-tailwind-prep-98d23c',
    )
    const [label] = new URL(url).hostname.split('.')
    expect(label).toHaveLength(63)
    expect(label).toMatch(/^design-system-git-claude-pages-shadcn-tailwind-pr-[0-9a-f]{6}-pmndrs$/)
  })

  it('leaves a long {branch} outside the hostname whole', async () => {
    const branch = `feat/${'x'.repeat(80)}`
    expect(await expandUrlTemplate('https://example.com/{branch}/', branch)).toBe(
      `https://example.com/${slugifyBranch(branch)}/`,
    )
  })

  it('URL-encodes the branch for {branch:raw}', async () => {
    expect(await expandUrlTemplate('https://example.com/?ref={branch:raw}', 'feat/a b')).toBe(
      'https://example.com/?ref=feat%2Fa%20b',
    )
  })

  it('reproduces Vercel branch URLs', async () => {
    const template = 'https://docs-git-{branch:vercel}-pmndrs.vercel.app'
    expect(await expandUrlTemplate(template, 'fix/tests/some-more')).toBe(
      'https://docs-git-fix-testssome-more-pmndrs.vercel.app',
    )
    expect(await expandUrlTemplate(template, 'dependabot/npm_and_yarn/three-0.185.1')).toBe(
      'https://docs-git-dependabot-npmandyarnthree-01851-pmndrs.vercel.app',
    )
    expect(await expandUrlTemplate(template, 'v3_docs')).toBe(
      'https://docs-git-v3docs-pmndrs.vercel.app',
    )
  })

  it('truncates and hashes a Vercel label over 63 characters', async () => {
    // Real drei preview URL
    expect(
      await expandUrlTemplate(
        'https://drei-git-{branch:vercel}-pmndrs.vercel.app',
        'dependabot/npm_and_yarn/storybook-packages-2749a4123f',
      ),
    ).toBe('https://drei-git-dependabot-npmandyarnstorybook-packages-3744e0-pmndrs.vercel.app')
  })

  it('needs "<project>-git-" before {branch:vercel} to hash a long branch', async () => {
    await expect(
      expandUrlTemplate(
        'https://{branch:vercel}-pmndrs.vercel.app',
        'dependabot/npm_and_yarn/storybook-packages-2749a4123f-and-more',
      ),
    ).rejects.toThrow('<project>-git-')
  })

  it('replaces every placeholder', async () => {
    expect(
      await expandUrlTemplate('https://{branch}.example.com/{branch:raw}/{branch}', 'feat/x'),
    ).toBe('https://feat-x.example.com/feat%2Fx/feat-x')
  })

  it('returns a template without placeholder unchanged', async () => {
    expect(await expandUrlTemplate('https://example.com/docs', 'feat/x')).toBe(
      'https://example.com/docs',
    )
  })

  it('throws on an unknown preset', async () => {
    await expect(expandUrlTemplate('https://{branch:heroku}.example.com', 'main')).rejects.toThrow(
      'Unknown branch preset "heroku"',
    )
    await expect(expandUrlTemplate('https://{branch:}.example.com', 'main')).rejects.toThrow(
      'Unknown branch preset ""',
    )
  })
})

describe('assertValidUrlTemplate', () => {
  it('accepts every known preset, and no placeholder at all', () => {
    expect(() =>
      assertValidUrlTemplate('https://{branch}.{branch:generic}.{branch:vercel}/{branch:raw}'),
    ).not.toThrow()
    expect(() => assertValidUrlTemplate('https://example.com/docs')).not.toThrow()
  })

  it('throws on an unknown preset, as expanding would', () => {
    expect(() => assertValidUrlTemplate('https://{branch}.{branch:heroku}.example.com')).toThrow(
      'Unknown branch preset "heroku"',
    )
  })
})
