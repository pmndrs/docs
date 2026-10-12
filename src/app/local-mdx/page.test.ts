import { expect, test } from '@playwright/test'
import { execFile } from 'node:child_process'
import { createServer, type Server } from 'node:http'
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
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
  'package.json': JSON.stringify({
    name: 'local-mdx-consumer',
    type: 'module',
    packageManager: 'pnpm@10.28.1',
    dependencies: {
      '@pmndrs/docs': 'file:./engine.tgz',
      '@types/react': '^19.3.0',
      '@types/react-dom': '^19.3.0',
      react: '^19.3.0',
      'react-dom': '^19.3.0',
    },
  }),
  'docs/plain.mdx': '# Plain documentation\n\nOrdinary MDX still works.\n',
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
  'BuildInfo.tsx': `import { defineMdxComponent, getMdxBuildContext, type MdxBuildContext } from '@pmndrs/docs/mdx'
function describe(context: MdxBuildContext) { return context.refType + ':' + context.ref + ':' + context.label }
export const BuildInfo = defineMdxComponent({
  component: () => <p>{describe(getMdxBuildContext())}</p>,
  toMarkdown: (_props, context) => describe(context),
})
`,
  'docs/colours.mdx': `---
title: Local palette
---

import { Palette } from '../Palette'
import { seed } from '../data'
import { BuildInfo } from '../BuildInfo'

<Palette seed={seed} />
<BuildInfo />

Historical: theme@v0.1.0
`,
}

test.beforeAll(async ({}, testInfo) => {
  // The behavior is viewport independent; build once in the desktop project.
  test.skip(testInfo.project.name === 'w375', 'Covered by the desktop export test')
  testInfo.setTimeout(300_000)
  fixture = await mkdtemp(join(tmpdir(), 'docs-website-consumer-'))
  output = join(fixture, 'output')
  await mkdir(join(fixture, 'docs'))
  await exec(process.execPath, ['scripts/build-cli.mjs'], { cwd: packageRoot })
  const { stdout: packed } = await exec(
    'npm',
    [
      'pack',
      '--ignore-scripts',
      '--json',
      '--cache',
      join(fixture, '.npm-cache'),
      '--pack-destination',
      fixture,
    ],
    { cwd: packageRoot, maxBuffer: 10 * 1024 * 1024 },
  )
  const [{ filename }] = JSON.parse(packed) as { filename: string }[]
  await rename(join(fixture, filename), join(fixture, 'engine.tgz'))
  await writeFile(join(fixture, 'package.json'), sources['package.json'])
  await exec('pnpm', ['install'], {
    cwd: fixture,
    timeout: 120_000,
    maxBuffer: 10 * 1024 * 1024,
  }).catch((error) => {
    throw new Error(`Consumer dependency installation failed:\n${error.stdout}\n${error.stderr}`)
  })
  // Only the packed runtime dependency graph is available to this consumer.
  const installedCli = join(fixture, 'node_modules/@pmndrs/docs/bin/pmndrs-docs.mjs')
  await Promise.all(
    Object.entries(sources).map(async ([file, contents]) => {
      await mkdir(dirname(join(fixture, file)), { recursive: true })
      await writeFile(join(fixture, file), contents)
    }),
  )
  const buildFixture = (release = false) =>
    exec(
      process.execPath,
      [
        installedCli,
        'build',
        join(fixture, 'docs'),
        output,
        '--format',
        'website',
        '--lib-version',
        'Friendly label',
        '--libname',
        'Local components',
        '--url',
        'https://example.test',
        '--home-redirect',
        '/colours',
      ],
      {
        cwd: fixture,
        timeout: 240_000,
        maxBuffer: 10 * 1024 * 1024,
        env: {
          ...process.env,
          GITHUB_REF_TYPE: release ? 'tag' : 'branch',
          GITHUB_REF_NAME: release ? 'v1.2.3' : 'main',
          GITHUB_HEAD_REF: '',
          GITHUB_EVENT_PATH: '',
          GITHUB_EVENT_NAME: 'push',
          GITHUB_REF: release ? 'refs/tags/v1.2.3' : 'refs/heads/main',
        },
      },
    )

  const pageFile = join(fixture, 'docs/colours.mdx')
  for (const refType of ['branch', 'tag']) {
    const { stdout } = await exec(
      process.execPath,
      [installedCli, 'build', pageFile, '--lib-version', 'Friendly label'],
      {
        cwd: fixture,
        env: {
          ...process.env,
          GITHUB_REF_TYPE: refType,
          GITHUB_REF_NAME: refType === 'tag' ? 'v1.2.3' : 'main',
          GITHUB_HEAD_REF: '',
          GITHUB_EVENT_PATH: '',
          GITHUB_EVENT_NAME: 'push',
          GITHUB_REF: refType === 'tag' ? 'refs/tags/v1.2.3' : 'refs/heads/main',
        },
      },
    )
    expect(stdout).toContain(
      refType === 'tag' ? 'tag:v1.2.3:Friendly label' : 'branch:main:Friendly label',
    )
  }
  await writeFile(pageFile, sources['docs/colours.mdx'].replace('seed={seed}', 'seed={42}'))
  await expect(buildFixture()).rejects.toThrow('not assignable to type')
  await expect(readFile(join(fixture, '.pmndrs-docs'))).rejects.toMatchObject({ code: 'ENOENT' })
  await writeFile(
    pageFile,
    'import { Counter } from \'../Counter\'\n\n<Counter seed="#CAF543" />\n',
  )
  await expect(buildFixture()).rejects.toThrow('must declare toMarkdown')
  await expect(readFile(join(fixture, '.pmndrs-docs'))).rejects.toMatchObject({ code: 'ENOENT' })
  await writeFile(pageFile, sources['docs/colours.mdx'])
  await buildFixture()
  await expect(readFile(join(fixture, '.pmndrs-docs'))).rejects.toMatchObject({ code: 'ENOENT' })
  for (const file of ['colours.html', 'colours.md', 'llms-full.txt']) {
    const content = await readFile(join(output, file), 'utf8')
    expect(content).toContain('branch:main:Friendly label')
    expect(content).toContain('Historical: theme@v0.1.0')
  }
  await buildFixture(true)
  await expect(readFile(join(fixture, '.pmndrs-docs'))).rejects.toMatchObject({ code: 'ENOENT' })
  for (const file of ['plain.html', 'plain.md']) {
    expect(await readFile(join(output, file), 'utf8')).toContain('Ordinary MDX still works.')
  }

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

test('installed package exports and hydrates typed local components without rewriting authored sources', async ({
  page,
}) => {
  await page.goto(`${url}/colours`)
  await page.waitForLoadState('networkidle')
  await expect(page.getByText('tag:v1.2.3:Friendly label', { exact: true })).toBeVisible()
  const palette = page.getByRole('button', { name: 'Palette #CAF543: 0' })
  await expect(palette).toBeVisible()
  await palette.click()
  await expect(page.getByRole('button', { name: 'Palette #CAF543: 1' })).toBeVisible()

  for (const file of ['colours.md', 'llms-full.txt']) {
    const markdown = await readFile(join(output, file), 'utf8')
    expect(markdown).toContain('Seed: #CAF543')
    expect(markdown).toContain('tag:v1.2.3:Friendly label')
    expect(markdown).toContain('Historical: theme@v0.1.0')
    expect(markdown).not.toContain('import {')
    expect(markdown).not.toContain('<Palette')
  }
  for (const [file, contents] of Object.entries(sources)) {
    expect(await readFile(join(fixture, file), 'utf8')).toBe(contents)
  }
})
