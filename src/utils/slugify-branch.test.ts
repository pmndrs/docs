import { describe, expect, it } from 'vitest'
import {
  assertValidUrlTemplate,
  expandUrlTemplate,
  slugifyBranch,
  slugifyBranchCloudflare,
  slugifyBranchNetlify,
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

describe('slugifyBranchCloudflare', () => {
  it('lowercases and turns non-alphanumeric characters into hyphens (documented example)', () => {
    expect(slugifyBranchCloudflare('fix/api')).toBe('fix-api')
  })

  it('cuts to 28 characters, then drops a trailing hyphen (observed aliases)', () => {
    expect(slugifyBranchCloudflare('download-api-add-filter-information')).toBe(
      'download-api-add-filter-info',
    )
    // The 28-character cut ends on "-", which then goes
    expect(slugifyBranchCloudflare('fix/placeholder-version-and-master-marker-test')).toBe(
      'fix-placeholder-version-and',
    )
  })
})

describe('slugifyBranchNetlify', () => {
  it('turns characters that are invalid in a URL into hyphens', () => {
    expect(slugifyBranchNetlify('staging')).toBe('staging')
    expect(slugifyBranchNetlify('feature/blog')).toBe('feature-blog')
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

  it('reproduces Cloudflare Pages and Netlify branch URLs', async () => {
    expect(
      await expandUrlTemplate(
        'https://{branch:cloudflare}.owid.pages.dev',
        'download-api-add-filter-information',
      ),
    ).toBe('https://download-api-add-filter-info.owid.pages.dev')
    expect(
      await expandUrlTemplate('https://{branch:netlify}--mysite.netlify.app', 'feature/blog'),
    ).toBe('https://feature-blog--mysite.netlify.app')
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
      assertValidUrlTemplate(
        'https://{branch}.{branch:generic}.{branch:vercel}.{branch:cloudflare}.{branch:netlify}/{branch:raw}',
      ),
    ).not.toThrow()
    expect(() => assertValidUrlTemplate('https://example.com/docs')).not.toThrow()
  })

  it('throws on an unknown preset, as expanding would', () => {
    expect(() => assertValidUrlTemplate('https://{branch}.{branch:heroku}.example.com')).toThrow(
      'Unknown branch preset "heroku"',
    )
  })
})
