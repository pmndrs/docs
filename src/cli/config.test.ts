import { load } from 'cheerio'
import { cp, mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, expect, test } from 'vitest'
import { loadDocsConfig } from './config'
import { renderFragment } from './render'

const roots: string[] = []
const require = createRequire(import.meta.url)

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'pmndrs-docs-loader-'))
  roots.push(root)
  return root
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

test('loads local TSX, JSON and hooks using the renderer React instance', async () => {
  const root = await fixture()
  await mkdir(join(root, 'node_modules'))
  await cp(dirname(require.resolve('react/package.json')), join(root, 'node_modules/react'), {
    recursive: true,
  })
  await writeFile(join(root, 'tokens.json'), JSON.stringify({ spacing: [{ value: 8 }] }))
  await writeFile(
    join(root, 'Tokens.tsx'),
    `import { useState } from 'react'
export function Tokens({ rows }: { rows: { value: number }[] }) {
  const [value] = useState(rows[0].value)
  return <output data-token-value={value} />
}`,
  )
  const path = join(root, 'docs.config.ts')
  await writeFile(
    path,
    `import { Tokens } from './Tokens'
import tokens from './tokens.json'
export default { components: { Tokens }, scope: { tokens } }`,
  )

  const config = await loadDocsConfig(path)
  const $ = load(
    await renderFragment('<Tokens rows={tokens.spacing} />', {
      absoluteFilePath: join(root, 'page.mdx'),
      config,
    }),
  )
  expect($('output').attr('data-token-value')).toBe('8')
  expect((await readdir(root)).filter((name) => name.startsWith('.pmndrs-docs-config-'))).toEqual(
    [],
  )
})

test('shares the renderer React instance with components imported from a consumer package', async () => {
  const root = await fixture()
  const packageDirectory = join(root, 'node_modules/fixture-components')
  await mkdir(packageDirectory, { recursive: true })
  await cp(dirname(require.resolve('react/package.json')), join(root, 'node_modules/react'), {
    recursive: true,
  })
  await writeFile(
    join(packageDirectory, 'package.json'),
    JSON.stringify({ name: 'fixture-components', type: 'commonjs', exports: './index.js' }),
  )
  await writeFile(
    join(packageDirectory, 'index.js'),
    `const { createElement, useState } = require('react')
const { basename } = require('node:path')
exports.Counter = function Counter() {
  const [value] = useState(5)
  return createElement('output', { 'data-count': value, 'data-package': basename('/consumer/tokens') })
}`,
  )
  const path = join(root, 'docs.config.ts')
  await writeFile(
    path,
    `import { Counter } from 'fixture-components'
export default { components: { Counter } }`,
  )

  const $ = load(
    await renderFragment('<Counter />', {
      absoluteFilePath: join(root, 'page.mdx'),
      config: await loadDocsConfig(path),
    }),
  )
  expect($('output').attr('data-count')).toBe('5')
  expect($('output').attr('data-package')).toBe('tokens')
})

test.each([
  ['export const config = {}', 'expected object'],
  ['export default { scope: { "bad-key": {} } }', 'Use a JavaScript identifier'],
  ['export default { components: { Invalid: 42 } }', 'Expected a React component'],
  ['export default {', 'Build failed'],
])('reports invalid modules and cleans up the temporary loader: %s', async (source, reason) => {
  const root = await fixture()
  const path = join(root, 'docs.config.ts')
  await writeFile(path, source)

  const result = loadDocsConfig(path)
  await expect(result).rejects.toMatchObject({
    message: expect.stringContaining(`Cannot load docs config ${path}`),
    cause: expect.any(Error),
  })
  await expect(result).rejects.toThrow(reason)
  expect(await readdir(root)).toEqual(['docs.config.ts'])
})

test('requires no consumer module when configuration is absent', async () => {
  expect(await loadDocsConfig()).toEqual({})
})
