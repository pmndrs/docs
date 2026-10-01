import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, test } from 'vitest'
import {
  filterBranches,
  getBranches,
  getCurrentBranch,
  getVersion,
  parseBranchList,
  parseLsRemote,
} from './git-info'

describe('parseLsRemote', () => {
  test('keeps the name after refs/heads/, slashes included', () => {
    const output = [
      'a1b2c3d4e5f6\trefs/heads/main',
      'b2c3d4e5f6a1\trefs/heads/fix/tests/some-more',
      'c3d4e5f6a1b2\trefs/heads/v3_docs',
      '',
    ].join('\n')
    expect(parseLsRemote(output)).toEqual(['main', 'fix/tests/some-more', 'v3_docs'])
  })

  test('ignores anything that is not a head', () => {
    const output = ['a1b2c3\tHEAD', 'b2c3d4\trefs/tags/v1.0.0', 'c3d4e5\trefs/heads/main'].join(
      '\n',
    )
    expect(parseLsRemote(output)).toEqual(['main'])
  })

  test('copes with CRLF and empty output', () => {
    expect(parseLsRemote('a1b2c3\trefs/heads/main\r\n')).toEqual(['main'])
    expect(parseLsRemote('')).toEqual([])
  })
})

describe('parseBranchList', () => {
  test('splits on commas, spaces and newlines alike', () => {
    expect(parseBranchList('main, next\nv9  feat/x,,')).toEqual(['main', 'next', 'v9', 'feat/x'])
  })

  test('an empty list is no branches', () => {
    expect(parseBranchList('  ,\n')).toEqual([])
  })
})

describe('filterBranches', () => {
  const branches = [
    'main',
    'dependabot/npm_and_yarn/three-0.185.1',
    'renovate/react-19.x',
    'changeset-release/main',
    'next',
    'feat/version-switcher',
  ]

  test('leaves the bot branches out by default, in the given order', () => {
    expect(filterBranches(branches)).toEqual(['main', 'next', 'feat/version-switcher'])
  })

  test('the default only excludes prefixes, not names that merely contain them', () => {
    expect(filterBranches(['fix/renovate/config'])).toEqual(['fix/renovate/config'])
  })

  test('an include regex alone decides, bots included', () => {
    expect(filterBranches(branches, '^(main|renovate/.*)$')).toEqual([
      'main',
      'renovate/react-19.x',
    ])
  })

  test('an include regex matches anywhere unless anchored', () => {
    expect(filterBranches(branches, 'main')).toEqual(['main', 'changeset-release/main'])
  })
})

describe('getCurrentBranch', () => {
  // A cwd that is not a repository, so that git has nothing to say and only env decides.
  const notARepo = mkdtempSync(join(tmpdir(), 'git-info-'))
  afterAll(() => rmSync(notARepo, { recursive: true, force: true }))

  test('a pull request names its source branch, over the merge ref', () => {
    const env = { GITHUB_HEAD_REF: 'feat/x', GITHUB_REF_NAME: '123/merge' }
    expect(getCurrentBranch({ cwd: notARepo, env })).toBe('feat/x')
  })

  test('a push names its branch', () => {
    const env = { GITHUB_HEAD_REF: '', GITHUB_REF_NAME: 'main' }
    expect(getCurrentBranch({ cwd: notARepo, env })).toBe('main')
  })

  test('hosts that build themselves name their branch', () => {
    expect(getCurrentBranch({ cwd: notARepo, env: { VERCEL_GIT_COMMIT_REF: 'feat/v' } })).toBe(
      'feat/v',
    )
    expect(getCurrentBranch({ cwd: notARepo, env: { CF_PAGES_BRANCH: 'feat/c' } })).toBe('feat/c')
    expect(getCurrentBranch({ cwd: notARepo, env: { NETLIFY: 'true', BRANCH: 'feat/n' } })).toBe(
      'feat/n',
    )
  })

  test('BRANCH alone is too generic a name: only Netlify is trusted with it', () => {
    expect(getCurrentBranch({ cwd: notARepo, env: { BRANCH: 'feat/n' } })).toBeUndefined()
  })

  test('GitHub first, then Vercel, Cloudflare Pages and Netlify', () => {
    const all = {
      GITHUB_HEAD_REF: 'github-pr',
      GITHUB_REF_NAME: 'github-push',
      VERCEL_GIT_COMMIT_REF: 'vercel',
      CF_PAGES_BRANCH: 'cloudflare',
      NETLIFY: 'true',
      BRANCH: 'netlify',
    }
    const branchOf = (env: Record<string, string>) => getCurrentBranch({ cwd: notARepo, env })

    expect(branchOf(all)).toBe('github-pr')
    expect(branchOf({ ...all, GITHUB_HEAD_REF: '' })).toBe('github-push')
    expect(branchOf({ ...all, GITHUB_HEAD_REF: '', GITHUB_REF_NAME: '' })).toBe('vercel')
    expect(
      branchOf({ ...all, GITHUB_HEAD_REF: '', GITHUB_REF_NAME: '', VERCEL_GIT_COMMIT_REF: '' }),
    ).toBe('cloudflare')
    expect(
      branchOf({
        ...all,
        GITHUB_HEAD_REF: '',
        GITHUB_REF_NAME: '',
        VERCEL_GIT_COMMIT_REF: '',
        CF_PAGES_BRANCH: '',
      }),
    ).toBe('netlify')
  })

  test('without CI variables nor git, there is no branch', () => {
    expect(getCurrentBranch({ cwd: notARepo, env: {} })).toBeUndefined()
  })
})

describe('outside a repository', () => {
  const notARepo = mkdtempSync(join(tmpdir(), 'git-info-'))
  afterAll(() => rmSync(notARepo, { recursive: true, force: true }))

  test('everything degrades to nothing', () => {
    expect(getVersion({ cwd: notARepo, env: {} })).toBeUndefined()
    expect(getBranches({ cwd: notARepo })).toEqual([])
  })

  test('an explicit branch list needs no git, and is taken as written', () => {
    expect(getBranches({ cwd: notARepo, list: 'next, main' })).toEqual(['next', 'main'])
  })
})

describe('in a local repository', () => {
  const repo = mkdtempSync(join(tmpdir(), 'git-info-'))
  const run = (...args: string[]) =>
    execFileSync('git', args, { cwd: repo, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' })
  const commit = (message: string) =>
    run(
      '-c',
      'user.name=test',
      '-c',
      'user.email=test@example.com',
      '-c',
      'commit.gpgsign=false',
      'commit',
      '--allow-empty',
      '-m',
      message,
    )

  run('init', '--quiet', '--initial-branch=main')
  commit('first')
  afterAll(() => rmSync(repo, { recursive: true, force: true }))

  test('without tags, the version is <branch>@<shortsha>', () => {
    const sha = run('rev-parse', '--short', 'HEAD').trim()
    expect(getVersion({ cwd: repo, env: {} })).toBe(`main@${sha}`)
  })

  test('a detached HEAD is no branch', () => {
    run('checkout', '--quiet', '--detach')
    expect(getCurrentBranch({ cwd: repo, env: {} })).toBeUndefined()
    run('checkout', '--quiet', 'main')
    expect(getCurrentBranch({ cwd: repo, env: {} })).toBe('main')
  })

  test('tags give the version, narrowed by tagMatch', () => {
    run('tag', 'v1.0.0')
    run('tag', 'leva@0.10.1')
    commit('second')
    expect(getVersion({ cwd: repo, tagMatch: 'v*', env: {} })).toMatch(/^v1\.0\.0-1-g[0-9a-f]+$/)
    expect(getVersion({ cwd: repo, tagMatch: 'leva@*', env: {} })).toMatch(
      /^leva@0\.10\.1-1-g[0-9a-f]+$/,
    )
  })

  test('no remote, no branches', () => {
    expect(getBranches({ cwd: repo })).toEqual([])
  })
})
