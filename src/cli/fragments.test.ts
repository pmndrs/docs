import { load } from 'cheerio'
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { afterEach, expect, test } from 'vitest'
import { buildFragments, extractFragment } from './fragments'

const run = promisify(execFile)
const packageRoot = fileURLToPath(new URL('../../', import.meta.url))
const temporaryDirectories: string[] = []

async function fixture(inPackage = false) {
  const parent = inPackage ? join(packageRoot, '.pmndrs-docs') : tmpdir()
  await mkdir(parent, { recursive: true })
  const root = await mkdtemp(join(parent, 'pmndrs-fragments-test-'))
  temporaryDirectories.push(root)
  return root
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((root) => rm(root, { recursive: true })))
})

test('extracts only the document body, removing styles and scripts inside it', async () => {
  const html = await extractFragment(
    `<!doctype html><html><head><title>Website</title></head>
    <body><div data-pmndrs-fragment><h1>Document</h1><section>
      <script>window.secret = true</script><style>body { color: red }</style>
      <link rel="stylesheet" href="/_next/styles.css"><p data-content="body">Content</p>
    </section></div><script>window.next = true</script></body></html>`,
    '/unused',
  )

  const $ = load(html!, {}, false)
  expect($('h1').text()).toBe('Document')
  expect($('[data-content="body"]').length).toBe(1)
  expect($('html, head, body, script, style, link, [data-pmndrs-fragment]').length).toBe(0)
  expect(html).not.toContain('_next')
})

test('ignores Next pages that do not contain a fragment wrapper', async () => {
  expect(await extractFragment('<html><body>Not found</body></html>', '/unused')).toBeNull()
})

test('embeds exported images with a base path and preserves ordinary image URLs', async () => {
  const root = await fixture()
  const media = join(root, '_next/static/media/icon.hash.svg')
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" />'
  await mkdir(dirname(media), { recursive: true })
  await writeFile(media, svg)
  const html = await extractFragment(
    `<div data-pmndrs-fragment>
    <img src="/docs/_next/static/media/icon.hash.svg" alt="imported">
    <img src="images/local.png" alt="local">
    <img src="https://example.com/remote.png" alt="remote">
  </div>`,
    root,
    '/docs',
  )

  const $ = load(html!, {}, false)
  expect($('img[alt="imported"]').attr('src')).toBe(
    `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
  )
  expect($('img[alt="local"]').attr('src')).toBe('images/local.png')
  expect($('img[alt="remote"]').attr('src')).toBe('https://example.com/remote.png')
  expect(html).not.toContain('_next')
})

test.each([
  ['/_next/static/media/%2e%2e%2fsecret.svg', 'escapes the exported media directory'],
  ['/_next/static/media/font.woff2', 'Unsupported exported image'],
  ['/_next/static/media/missing.png', 'ENOENT'],
])('rejects unusable exported media %s', async (src, error) => {
  const root = await fixture()
  await expect(
    extractFragment(`<div data-pmndrs-fragment><img src="${src}"></div>`, root),
  ).rejects.toThrow(error)
})

test.each(['img', 'source'])(
  'embeds responsive %s images without changing other candidates',
  async (tag) => {
    const root = await fixture()
    const media = join(root, '_next/static/media/icon.hash.svg')
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" />'
    await mkdir(dirname(media), { recursive: true })
    await writeFile(media, svg)
    const imported = '/docs/_next/static/media/icon.hash.svg'
    const embedded = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
    const candidates = `${imported}, ${imported} 2x, https://example.com/a,b.svg 3x, data:image/svg+xml,%3Csvg%3E,%3C/svg%3E 4x, local.png 5x`
    const html = await extractFragment(
      `<div data-pmndrs-fragment><picture><${tag} srcset="${candidates}"></picture></div>`,
      root,
      '/docs',
    )
    expect(load(html!, {}, false)(tag).attr('srcset')).toBe(
      `${embedded}, ${embedded} 2x, https://example.com/a,b.svg 3x, data:image/svg+xml,%3Csvg%3E,%3C/svg%3E 4x, local.png 5x`,
    )
  },
)

test('rejects traversal in responsive image candidates', async () => {
  const root = await fixture()
  await expect(
    extractFragment(
      '<div data-pmndrs-fragment><source srcset="local.png 1x, /_next/static/media/%2e%2e%2fsecret.svg 2x"></div>',
      root,
    ),
  ).rejects.toThrow('escapes the exported media directory')
})

test('copies assets and symlinked files from a folder without documents', async () => {
  const root = await fixture()
  const input = join(root, 'input')
  const output = join(input, 'out')
  await mkdir(output, { recursive: true })
  await writeFile(join(root, 'image.svg'), '<svg />')
  await symlink(join(root, 'image.svg'), join(input, 'image.svg'))
  await writeFile(join(output, 'previous.html'), '<p>Previous output</p>')

  expect(await buildFragments({ packageRoot, root: input, outDir: output, env: {} })).toBe(0)
  expect(await readFile(join(output, 'image.svg'), 'utf8')).toBe('<svg />')
  expect((await readdir(output)).sort()).toEqual(['image.svg', 'previous.html'])
})

test('builds nested MDX documents and static examples through Next and the CLI', async () => {
  await run(process.execPath, [join(packageRoot, 'scripts/build-cli.mjs')], { cwd: packageRoot })
  const root = await fixture(true)
  const input = join(root, 'input')
  const output = join(root, 'output')
  await mkdir(join(input, 'guide/example'), { recursive: true })
  await mkdir(join(root, 'examples/demo'), { recursive: true })
  await writeFile(
    join(input, 'index.mdx'),
    `---
title: Frontmatter title
---

> [!NOTE]
> A callout

<Hint>A hint</Hint>

<Keypoints><KeypointsItem>A key point</KeypointsItem></Keypoints>

<Grid cols={2}><div>First</div><div>Second</div></Grid>

<Intro>An introduction</Intro>

<Counter value={tokens.initial} />

<CustomTable rows={tokens.rows} />

<ImportedImage />

<Codesandbox id="new" />

<Sandpack folder="../examples/demo" />

<details>
<summary>Details</summary>

Detail content

</details>
`,
  )
  await writeFile(
    join(input, 'guide/start.mdx'),
    `# Body title

## Section one

![Local image](dog.png)

\`\`\`js
const value = 1
\`\`\`

\`\`\`mermaid
graph TD;
A-->B;
\`\`\`

<Sandpack folder="./example" />
`,
  )
  const example = 'export default function App() { return <main>Example</main> }'
  await writeFile(join(input, 'guide/example/App.tsx'), example)
  const externalExample = 'export default function App() { return <main>External example</main> }'
  await writeFile(join(root, 'examples/demo/App.tsx'), externalExample)
  const asset = Buffer.from([137, 80, 78, 71])
  await writeFile(join(input, 'guide/dog.png'), asset)

  await writeFile(
    join(root, 'tokens.json'),
    JSON.stringify({ initial: 3, rows: [{ value: '1rem' }] }),
  )
  await writeFile(join(root, 'consumer.css'), '[data-count] { color: red; }')
  await writeFile(
    join(root, 'icon.svg'),
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" />',
  )
  await writeFile(
    join(root, 'Counter.tsx'),
    `
'use client'
import { useState } from 'react'
export function Counter({ value }: { value: number }) {
  const [count] = useState(value)
  return <output data-count={count} />
}`,
  )
  await writeFile(
    join(root, 'docs.config.ts'),
    `
import { createElement } from 'react'
import { Counter } from './Counter'
import tokens from './tokens.json'
import icon from './icon.svg'
import './consumer.css'
export default {
  scope: { tokens },
  components: {
    Counter,
    async CustomTable({ rows }: { rows: { value: string }[] }) {
      const values = await Promise.resolve(rows)
      return createElement('table', { 'data-consumer-table': true },
        createElement('tbody', null, values.map(({ value }, index) =>
          createElement('tr', { key: index }, createElement('td', null, value)))))
    },
    ImportedImage() { return createElement('img', { src: icon.src, alt: 'Imported' }) },
  },
}`,
  )

  // Only the fixture configures the build; the developer's docs environment stays outside.
  const env: NodeJS.ProcessEnv = {
    NODE_ENV: 'production',
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    TMPDIR: process.env.TMPDIR,
    NEXT_TELEMETRY_DISABLED: '1',
  }
  const { stdout } = await run(
    process.execPath,
    [join(packageRoot, 'bin/pmndrs-docs.mjs'), 'build', input, output],
    { cwd: root, env, maxBuffer: 10 * 1024 * 1024, timeout: 170_000 },
  )
  expect(stdout).toBe('')

  expect((await readdir(output)).sort()).toEqual(['guide', 'index.html'])
  expect((await readdir(join(output, 'guide'))).sort()).toEqual([
    'dog.png',
    'example',
    'start.html',
  ])
  expect(await readFile(join(output, 'guide/dog.png'))).toEqual(asset)
  expect(await readFile(join(output, 'guide/example/App.tsx'), 'utf8')).toBe(example)

  const indexHtml = await readFile(join(output, 'index.html'), 'utf8')
  const guideHtml = await readFile(join(output, 'guide/start.html'), 'utf8')
  for (const html of [indexHtml, guideHtml]) {
    const $ = load(html, {}, false)
    expect($('html, head, body, script, style, link, [data-pmndrs-fragment]').length).toBe(0)
    expect(html).not.toContain('/_next/')
  }

  const index = load(indexHtml, {}, false)
  expect(index('h1').text()).toBe('Frontmatter title')
  expect(index('[role="note"]').length).toBeGreaterThanOrEqual(2)
  expect(index('[data-count]').attr('data-count')).toBe('3')
  expect(index('[data-consumer-table] td').text()).toBe('1rem')
  expect(index('img[alt="Imported"]').attr('src')).toMatch(/^data:image\/svg\+xml;base64,/)
  expect(await readFile(join(root, 'tokens.json'), 'utf8')).toContain('1rem')
  expect(index('.grid-list').length).toBe(1)
  expect(index('details > summary').length).toBe(1)
  expect(index('a[href="https://codesandbox.io/s/new"]').length).toBe(1)
  expect(index('.sandpack code.language-tsx').text()).toBe(externalExample)

  const guide = load(guideHtml, {}, false)
  expect(
    guide('h1')
      .toArray()
      .map((heading) => guide(heading).text()),
  ).toContain('Body title')
  expect(guide('#section-one').length).toBe(1)
  expect(guide('img[alt="Local image"]').attr('src')).toBe('dog.png')
  expect(guide('code.language-js').text()).toContain('const value = 1')
  expect(guide('pre.language-mermaid code').text()).toContain('graph TD;\nA-->B;')
  expect(guide('.sandpack').length).toBe(1)
  expect(guide('.sandpack code.language-tsx').text()).toBe(example)
}, 180_000)
