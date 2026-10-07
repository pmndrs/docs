import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
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
  })

  test('GitHub first, then Vercel', () => {
    const all = {
      GITHUB_HEAD_REF: 'github-pr',
      GITHUB_REF_NAME: 'github-push',
      VERCEL_GIT_COMMIT_REF: 'vercel',
    }
    const branchOf = (env: Record<string, string>) => getCurrentBranch({ cwd: notARepo, env })

    expect(branchOf(all)).toBe('github-pr')
    expect(branchOf({ ...all, GITHUB_HEAD_REF: '' })).toBe('github-push')
    expect(branchOf({ ...all, GITHUB_HEAD_REF: '', GITHUB_REF_NAME: '' })).toBe('vercel')
  })

  test('a pushed tag is no branch: GITHUB_REF_NAME is then ignored', () => {
    const tagPush = { GITHUB_REF_NAME: 'v1.0.0', GITHUB_REF_TYPE: 'tag' }
    expect(getCurrentBranch({ cwd: notARepo, env: tagPush })).toBeUndefined()
    expect(
      getCurrentBranch({ cwd: notARepo, env: { ...tagPush, VERCEL_GIT_COMMIT_REF: 'vercel' } }),
    ).toBe('vercel')
    expect(
      getCurrentBranch({ cwd: notARepo, env: { ...tagPush, GITHUB_REF_TYPE: 'branch' } }),
    ).toBe('v1.0.0')
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

  describe('on a GitHub pull request run', () => {
    // The checkout GitHub gives: the PR's head on a branch, and a merge commit, on none, checked
    // out on top of it.
    const eventDir = mkdtempSync(join(tmpdir(), 'git-info-event-'))
    const eventPath = join(eventDir, 'event.json')
    const writeEvent = (event: unknown) => writeFileSync(eventPath, JSON.stringify(event))
    afterAll(() => rmSync(eventDir, { recursive: true, force: true }))

    let head: string
    beforeAll(() => {
      run('checkout', '--quiet', '-b', 'feat/pr')
      commit('pr head')
      head = run('rev-parse', 'HEAD').trim()
      run('tag', 'v2.0.0')
      run('checkout', '--quiet', '--detach')
      commit('synthetic merge')
    })
    afterAll(() => run('checkout', '--quiet', 'main'))

    test('describes the head of the PR, not the merge commit checked out', () => {
      writeEvent({ pull_request: { head: { sha: head } } })
      expect(getVersion({ cwd: repo, env: { GITHUB_EVENT_PATH: eventPath } })).toBe('v2.0.0')
      // HEAD itself is one commit past the tag.
      expect(getVersion({ cwd: repo, env: {} })).toMatch(/^v2\.0\.0-1-g[0-9a-f]+$/)
    })

    test('falls back to the head commit short sha when no tag matches', () => {
      writeEvent({ pull_request: { head: { sha: head } } })
      const env = { GITHUB_EVENT_PATH: eventPath, GITHUB_HEAD_REF: 'feat/pr' }
      const shortHead = run('rev-parse', '--short', head).trim()
      expect(getVersion({ cwd: repo, tagMatch: 'nomatch@*', env })).toBe(`feat/pr@${shortHead}`)
    })

    test('describes HEAD when the payload cannot say which commit, or names one not fetched', () => {
      const describedHead = getVersion({ cwd: repo, env: {} })

      writeEvent({ pull_request: { head: { sha: 'f'.repeat(40) } } })
      expect(getVersion({ cwd: repo, env: { GITHUB_EVENT_PATH: eventPath } })).toBe(describedHead)

      writeEvent({ ref: 'refs/heads/main' })
      expect(getVersion({ cwd: repo, env: { GITHUB_EVENT_PATH: eventPath } })).toBe(describedHead)

      writeFileSync(eventPath, '{ not json')
      expect(getVersion({ cwd: repo, env: { GITHUB_EVENT_PATH: eventPath } })).toBe(describedHead)

      const missing = join(eventDir, 'no-such-event.json')
      expect(getVersion({ cwd: repo, env: { GITHUB_EVENT_PATH: missing } })).toBe(describedHead)
    })
  })

  test('no remote, no branches', () => {
    expect(getBranches({ cwd: repo })).toEqual([])
  })
})
