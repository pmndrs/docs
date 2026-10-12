import { expect, test } from '@playwright/test'
import { execFile } from 'node:child_process'
import { createServer, type Server } from 'node:http'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, extname, join } from 'node:path'
import { promisify } from 'node:util'

const exec = promisify(execFile)
const packageRoot = process.cwd()
let fixture: string
let output: string
let url: string
let server: Server | undefined

const sources = {
  'package.json': '{"name":"local-mdx-consumer","type":"module"}',
  'data.ts': "export const seed = '#CAF543'\n",
  'Counter.tsx': `'use client'
import { useState } from 'react'
import { label } from 'local-extra'
export function Counter({ seed }: { seed: string }) {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{label} {seed}: {count}</button>
}
`,
  'node_modules/local-extra/package.json':
    '{"name":"local-extra","type":"module","main":"index.js","types":"index.d.ts"}',
  'node_modules/local-extra/index.js': "export const label = 'Palette'\n",
  'node_modules/local-extra/index.d.ts': 'export declare const label: string\n',
  'Palette.tsx': `import { defineMdxComponent } from '@pmndrs/docs/mdx'
import { Counter } from './Counter'
export const Palette = defineMdxComponent({
  component: Counter,
  toMarkdown: ({ seed }) => 'Seed: ' + seed,
})
`,
  'docs/colours.mdx': `---
title: Local palette
---

import { Palette } from '../Palette'
import { seed } from '../data'

<Palette seed={seed} />
`,
}

test.beforeAll(async ({}, testInfo) => {
  // The behavior is viewport independent; build once in the desktop project.
  test.skip(testInfo.project.name === 'w375', 'Covered by the desktop export test')
  testInfo.setTimeout(300_000)
  fixture = await mkdtemp(join(tmpdir(), 'docs-website-consumer-'))
  output = join(fixture, 'output')
  await mkdir(join(fixture, 'docs'))
  await Promise.all(
    Object.entries(sources).map(async ([file, contents]) => {
      await mkdir(dirname(join(fixture, file)), { recursive: true })
      await writeFile(join(fixture, file), contents)
    }),
  )
  await exec(process.execPath, ['scripts/build-cli.mjs'], { cwd: packageRoot })
  const buildFixture = () =>
    exec(
      process.execPath,
      [
        join(packageRoot, 'bin/pmndrs-docs.mjs'),
        'build',
        join(fixture, 'docs'),
        output,
        '--format',
        'website',
        '--libname',
        'Local components',
        '--url',
        'https://example.test',
        '--home-redirect',
        '/colours',
      ],
      { cwd: packageRoot, timeout: 240_000, maxBuffer: 10 * 1024 * 1024 },
    )

  const pageFile = join(fixture, 'docs/colours.mdx')
  await writeFile(pageFile, sources['docs/colours.mdx'].replace('seed={seed}', 'seed={42}'))
  await expect(buildFixture()).rejects.toThrow('not assignable to type')
  await writeFile(
    pageFile,
    'import { Counter } from \'../Counter\'\n\n<Counter seed="#CAF543" />\n',
  )
  await expect(buildFixture()).rejects.toThrow('must declare toMarkdown')
  await writeFile(pageFile, sources['docs/colours.mdx'])
  await buildFixture()

  const mime: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
  }
  server = createServer(async (request, response) => {
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
    const file = pathname === '/colours' ? '/colours.html' : pathname
    try {
      const body = await readFile(join(output, file))
      response.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream')
      response.end(body)
    } catch {
      response.writeHead(404).end()
    }
  })
  await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Missing fixture server port')
  url = `http://127.0.0.1:${address.port}`
})

test.afterAll(async () => {
  if (server) await new Promise<void>((resolve) => server!.close(() => resolve()))
  if (fixture) await rm(fixture, { recursive: true, force: true })
})

test('exports and hydrates typed local components without rewriting authored sources', async ({
  page,
}) => {
  await page.goto(`${url}/colours`)
  await page.waitForLoadState('networkidle')
  const palette = page.getByRole('button', { name: 'Palette #CAF543: 0' })
  await expect(palette).toBeVisible()
  await palette.click()
  await expect(page.getByRole('button', { name: 'Palette #CAF543: 1' })).toBeVisible()

  for (const file of ['colours.md', 'llms-full.txt']) {
    const markdown = await readFile(join(output, file), 'utf8')
    expect(markdown).toContain('Seed: #CAF543')
    expect(markdown).not.toContain('import {')
    expect(markdown).not.toContain('<Palette')
  }
  for (const [file, contents] of Object.entries(sources)) {
    expect(await readFile(join(fixture, file), 'utf8')).toBe(contents)
  }
})
