import { describe, expect, test, vi } from 'vitest'
import { assertValidUrlTemplate } from '../utils/slugify-branch'
import { VERSION_ENV_KEYS, resolveVersionEnv, type Git } from './version-env'

/** A git that answers as told, and records what it was asked. */
function fakeGit({ version = 'v1.2.3', branch = 'feat/x', branches = ['main', 'next'] } = {}) {
  return {
    getVersion: vi.fn<Git['getVersion']>(() => version),
    getCurrentBranch: vi.fn<Git['getCurrentBranch']>(() => branch),
    getBranches: vi.fn<Git['getBranches']>(() => branches),
  }
}

const TEMPLATE = 'https://docs-git-{branch}-pmndrs.vercel.app'

describe('resolveVersionEnv', () => {
  test('labels the build with git describe, narrowed by TAG_MATCH, in the given cwd', () => {
    const git = fakeGit()
    const env = resolveVersionEnv(
      { TAG_MATCH: 'leva@*' },
      { cwd: '/repo', git, assertValidUrlTemplate },
    )

    expect(env.NEXT_PUBLIC_VERSION_LABEL).toBe('v1.2.3')
    expect(env.NEXT_PUBLIC_VERSION_BRANCH).toBe('feat/x')
    expect(git.getVersion).toHaveBeenCalledWith({ cwd: '/repo', tagMatch: 'leva@*' })
  })

  test('LIB_VERSION wins, and git describe is not even asked', () => {
    const git = fakeGit()
    const env = resolveVersionEnv({ LIB_VERSION: '9.9.9' }, { git, assertValidUrlTemplate })

    expect(env.NEXT_PUBLIC_VERSION_LABEL).toBe('9.9.9')
    expect(git.getVersion).not.toHaveBeenCalled()
  })

  test('without a template: no switcher, so no branches, and no remote asked', () => {
    const git = fakeGit()
    const env = resolveVersionEnv({}, { git, assertValidUrlTemplate })

    expect(env.NEXT_PUBLIC_VERSION_URL_TEMPLATE).toBe('')
    expect(env.NEXT_PUBLIC_VERSION_BRANCHES).toBe('[]')
    expect(git.getBranches).not.toHaveBeenCalled()
  })

  test('the production branch defaults to main', () => {
    const env = resolveVersionEnv({}, { git: fakeGit(), assertValidUrlTemplate })
    expect(env.NEXT_PUBLIC_VERSION_PRODUCTION_BRANCH).toBe('main')
  })

  test('with a template: the production branch first, the current one always included', () => {
    const git = fakeGit({ branch: 'feat/x', branches: ['alpha', 'next'] })
    const env = resolveVersionEnv(
      {
        VERSION_URL_TEMPLATE: TEMPLATE,
        VERSION_PRODUCTION_BRANCH: 'trunk',
        VERSION_BRANCHES: '^v\\d+$',
        VERSION_BRANCHES_LIST: 'alpha,next',
      },
      { cwd: '/repo', git, assertValidUrlTemplate },
    )

    expect(env.NEXT_PUBLIC_VERSION_URL_TEMPLATE).toBe(TEMPLATE)
    expect(env.NEXT_PUBLIC_VERSION_PRODUCTION_BRANCH).toBe('trunk')
    expect(JSON.parse(env.NEXT_PUBLIC_VERSION_BRANCHES)).toEqual([
      'trunk',
      'alpha',
      'feat/x',
      'next',
    ])
    expect(git.getBranches).toHaveBeenCalledWith({
      cwd: '/repo',
      include: '^v\\d+$',
      list: 'alpha,next',
    })
  })

  test('with a template: no duplicate when the remote already lists them', () => {
    const git = fakeGit({ branch: 'main', branches: ['main', 'next'] })
    const env = resolveVersionEnv(
      { VERSION_URL_TEMPLATE: TEMPLATE },
      { git, assertValidUrlTemplate },
    )

    expect(JSON.parse(env.NEXT_PUBLIC_VERSION_BRANCHES)).toEqual(['main', 'next'])
  })

  test('git knowing nothing still yields every variable, empty', () => {
    const git = fakeGit({ branches: [] })
    git.getVersion.mockReturnValue(undefined)
    git.getCurrentBranch.mockReturnValue(undefined)
    const env = resolveVersionEnv(
      { VERSION_URL_TEMPLATE: TEMPLATE },
      { git, assertValidUrlTemplate },
    )

    expect(env).toEqual({
      NEXT_PUBLIC_VERSION_LABEL: '',
      NEXT_PUBLIC_VERSION_BRANCH: '',
      NEXT_PUBLIC_VERSION_URL_TEMPLATE: TEMPLATE,
      NEXT_PUBLIC_VERSION_PRODUCTION_BRANCH: 'main',
      NEXT_PUBLIC_VERSION_BRANCHES: '["main"]',
    })
  })

  test('the listed branches are sorted and deduped here, whatever order git gives', () => {
    const git = fakeGit({ branch: 'feat/x', branches: ['next', 'alpha', 'next', 'main'] })
    const env = resolveVersionEnv(
      { VERSION_URL_TEMPLATE: TEMPLATE },
      { git, assertValidUrlTemplate },
    )

    expect(JSON.parse(env.NEXT_PUBLIC_VERSION_BRANCHES)).toEqual([
      'main',
      'alpha',
      'feat/x',
      'next',
    ])
  })

  test('an unknown {branch:<preset>} in the template fails the build', () => {
    expect(() =>
      resolveVersionEnv(
        { VERSION_URL_TEMPLATE: 'https://{branch:heroku}.example.com' },
        { git: fakeGit(), assertValidUrlTemplate },
      ),
    ).toThrow('Unknown branch preset "heroku"')
  })

  test('an invalid VERSION_BRANCHES regex fails the build', () => {
    expect(() =>
      resolveVersionEnv({ VERSION_BRANCHES: '^(main' }, { git: fakeGit(), assertValidUrlTemplate }),
    ).toThrow('VERSION_BRANCHES is not a valid regular expression ("^(main")')
  })

  test('VERSION_ENV_KEYS names every variable resolved', () => {
    const env = resolveVersionEnv({}, { git: fakeGit(), assertValidUrlTemplate })
    expect([...VERSION_ENV_KEYS].sort()).toEqual(Object.keys(env).sort())
  })
})
