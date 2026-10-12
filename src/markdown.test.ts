import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it } from 'vitest'
import { resolveMdxBuildContext } from './markdown'

const folders: string[] = []
afterEach(() =>
  folders.splice(0).forEach((folder) => rmSync(folder, { recursive: true, force: true })),
)
function repository() {
  const cwd = mkdtempSync(join(tmpdir(), 'docs-source-context-'))
  folders.push(cwd)
  const git = (...args: string[]) =>
    execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  git('init', '-b', 'main')
  git(
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.test',
    'commit',
    '--allow-empty',
    '-m',
    'Initial',
  )
  git('tag', 'v1.2.3')
  return { cwd, git }
}

it('keeps main as a branch at a release tag and preserves a separate overridden label', () => {
  const { cwd, git } = repository()
  expect(resolveMdxBuildContext({ cwd, env: { LIB_VERSION: 'Friendly release' } })).toEqual({
    label: 'Friendly release',
    branch: 'main',
    ref: 'main',
    refType: 'branch',
    commit: git('rev-parse', 'HEAD'),
  })
})

it('uses the exact requested GitHub tag even if the local checkout has a branch', () => {
  const { cwd, git } = repository()
  expect(
    resolveMdxBuildContext({
      cwd,
      env: { GITHUB_REF_TYPE: 'tag', GITHUB_REF_NAME: 'v1.2.3', LIB_VERSION: 'Unrelated label' },
    }),
  ).toEqual({
    label: 'Unrelated label',
    branch: '',
    ref: 'v1.2.3',
    refType: 'tag',
    commit: git('rev-parse', 'HEAD'),
  })
})

it('identifies detached exact tags but never pins a nearest-tag description as a release', () => {
  const { cwd, git } = repository()
  git('checkout', '--detach', 'v1.2.3')
  expect(resolveMdxBuildContext({ cwd, env: {} })).toMatchObject({
    ref: 'v1.2.3',
    refType: 'tag',
    branch: '',
  })
  git(
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.test',
    'commit',
    '--allow-empty',
    '-m',
    'After release',
  )
  expect(resolveMdxBuildContext({ cwd, env: {} })).toEqual({
    label: expect.stringMatching(/^v1\.2\.3-1-g/),
    branch: '',
    ref: git('rev-parse', 'HEAD'),
    refType: 'commit',
    commit: git('rev-parse', 'HEAD'),
  })
})

it('uses a pull request head rather than GitHub synthetic merge, even if the head is not fetched', () => {
  const { cwd } = repository()
  const sha = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  const event = join(cwd, 'event.json')
  writeFileSync(event, JSON.stringify({ pull_request: { head: { sha, ref: 'feature/docs' } } }))
  expect(
    resolveMdxBuildContext({
      cwd,
      env: {
        GITHUB_EVENT_PATH: event,
        GITHUB_HEAD_REF: 'feature/docs',
        GITHUB_REF_NAME: '123/merge',
        GITHUB_SHA: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      },
    }),
  ).toMatchObject({ branch: 'feature/docs', ref: 'feature/docs', refType: 'branch', commit: sha })
  expect(
    resolveMdxBuildContext({
      cwd,
      env: {
        GITHUB_EVENT_NAME: 'pull_request',
        GITHUB_REF: 'refs/pull/123/merge',
        GITHUB_REF_NAME: '123/merge',
        GITHUB_SHA: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      },
    }),
  ).toMatchObject({ branch: '', ref: '', refType: 'unknown', commit: '' })
})

it('supports explicit no-git context and rejects malformed context without inventing main', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'docs-no-git-'))
  folders.push(cwd)
  expect(resolveMdxBuildContext({ cwd, env: {} })).toEqual({
    label: '',
    branch: '',
    ref: '',
    refType: 'unknown',
    commit: '',
  })
  const context = {
    label: 'Offline release',
    branch: '',
    ref: 'v2.0.0',
    refType: 'tag' as const,
    commit: '',
  }
  const resolved = resolveMdxBuildContext({ cwd, env: {}, context })
  expect(resolved).toEqual(context)
  expect(Object.isFrozen(resolved)).toBe(true)
  expect(resolved).not.toBe(context)
  expect(
    resolveMdxBuildContext({ cwd, env: { MDX_BUILD_CONTEXT: JSON.stringify(context) } }),
  ).toEqual(context)
  expect(() =>
    resolveMdxBuildContext({ cwd, env: { MDX_BUILD_CONTEXT: '{"refType":"tag"}' } }),
  ).toThrow('Invalid MDX build context')
})
