import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, test } from 'vitest'
import { commonRoot, resolveDocsConfig } from './config.resolve.js'

const roots: string[] = []

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'pmndrs-docs-resolve-'))
  roots.push(root)
  return root
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

test('discovers docs.config.ts in the caller working directory only', async () => {
  const root = await fixture()
  const child = join(root, 'child')
  await mkdir(child)
  await writeFile(join(root, 'docs.config.ts'), 'export default {}')

  expect(resolveDocsConfig(root, undefined)).toBe(join(root, 'docs.config.ts'))
  expect(resolveDocsConfig(child, undefined)).toBeUndefined()
})

test('resolves explicit relative and absolute paths before the conventional file', async () => {
  const root = await fixture()
  await writeFile(join(root, 'docs.config.ts'), 'export default {}')
  await writeFile(join(root, 'custom.config.ts'), 'export default {}')

  expect(resolveDocsConfig(root, './custom.config.ts')).toBe(join(root, 'custom.config.ts'))
  expect(resolveDocsConfig(root, join(root, 'custom.config.ts'))).toBe(
    join(root, 'custom.config.ts'),
  )
  expect(() => resolveDocsConfig(root, './missing.config.ts')).toThrow(
    `Docs config not found: ${join(root, 'missing.config.ts')}`,
  )
})

test('uses the renderer default when the conventional file is absent', async () => {
  expect(resolveDocsConfig(await fixture(), undefined)).toBeUndefined()
})

test('keeps sibling consumer and app modules inside the bundler root', () => {
  expect(commonRoot('/workspace/app', '/workspace/consumer/docs')).toBe('/workspace')
  expect(commonRoot('/workspace/app', '/workspace/app/config')).toBe('/workspace/app')
})
