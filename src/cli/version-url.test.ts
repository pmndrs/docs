import { afterEach, expect, test, vi } from 'vitest'
import { main } from './main'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

/** Runs the CLI and returns what it wrote to stdout. */
async function stdoutOf(argv: string[]): Promise<string> {
  let out = ''
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    out += String(chunk)
    return true
  })
  await main(argv)
  return out
}

test('prints the URL the template gives the branch, hostname label bounded', async () => {
  const out = await stdoutOf([
    'version-url',
    '--version-url-template',
    'https://design-system-git-{branch}-pmndrs.vercel.app/design-system',
    '--branch',
    'claude/pages-shadcn-tailwind-prep-98d23c',
  ])
  expect(out).toBe(
    'https://design-system-git-claude-pages-shadcn-tailwind-pr-2675d4-pmndrs.vercel.app/design-system\n',
  )
})

test('reads the template from VERSION_URL_TEMPLATE, and the branch from the CI', async () => {
  vi.stubEnv('VERSION_URL_TEMPLATE', 'https://docs-git-{branch}-pmndrs.vercel.app')
  vi.stubEnv('GITHUB_HEAD_REF', 'feat/Switcher')
  expect(await stdoutOf(['version-url'])).toBe('https://docs-git-feat-switcher-pmndrs.vercel.app\n')
})

test('--hostname prints the hostname alone, the alias to set', async () => {
  const out = await stdoutOf([
    'version-url',
    '--hostname',
    '--version-url-template',
    'https://docs-git-{branch}-pmndrs.vercel.app/some/path',
    '--branch',
    'feat/x',
  ])
  expect(out).toBe('docs-git-feat-x-pmndrs.vercel.app\n')
})

test('fails without a template', async () => {
  vi.stubEnv('VERSION_URL_TEMPLATE', '')
  await expect(main(['version-url', '--branch', 'feat/x'])).rejects.toThrow('VERSION_URL_TEMPLATE')
})
