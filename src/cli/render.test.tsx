import { mkdtemp, readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { main } from './main'
import { renderFragment } from './render'

const render = (source: string) =>
  renderFragment(source, { absoluteFilePath: join(process.cwd(), 'docs/authoring/fixture.mdx') })

/**
 * One case per authoring module, asserting the markup it is recognizable by rather than the
 * whole of its output — the latter changes every time a class name does.
 *
 * `Contributors`, `Backers` and `Sandpack` are left out: the first two fetch from GitHub, and
 * the third reads a folder. They are covered by compiling the `docs/` folder instead.
 */
test.each([
  ['Gha', '> [!NOTE]\n> hello', 'bg-note-container'],
  ['Hint', '<Hint>hi</Hint>', 'bg-note-container'],
  ['Code', '```js\nconst a = 1\n```', 'language-js'],
  ['Mermaid', '```mermaid\ngraph TD;\nA-->B;\n```', 'graph TD;'],
  ['Keypoints', '<Keypoints><KeypointsItem>a</KeypointsItem></Keypoints>', 'Keypoints'],
  ['Grid', '<Grid cols={2}>\n  <div>a</div>\n</Grid>', 'grid-list'],
  ['Intro', '<Intro>lead</Intro>', 'lead'],
  ['Img', '![a dog](dog.png)', '<img'],
  ['Codesandbox', '<Codesandbox id="new" />', 'codesandbox'],
  ['Details', '<details>\n  <summary>s</summary>\n\nbody\n\n</details>', '<details'],
  ['heading anchors', '## Section one', 'id="section-one"'],
])('renders %s', async (_name, source, marker) => {
  expect(await render(source)).toContain(marker)
})

test('renders the title, which the website takes from the layout instead', async () => {
  expect(await render('# In the body')).toMatch(/<h1[^>]*>In the body<\/h1>/)
  expect(await render('---\ntitle: From frontmatter\n---\n\nbody')).toMatch(
    /<h1[^>]*>From frontmatter<\/h1>/,
  )
})

test('compiles a folder to one HTML file per doc, assets alongside', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pmndrs-docs-'))
  const from = join(root, 'in')
  const to = join(root, 'out')

  await mkdir(join(from, 'guide'), { recursive: true })
  await writeFile(join(from, 'index.mdx'), '---\ntitle: Home\n---\n\nhello')
  await writeFile(join(from, 'guide/start.mdx'), '# Start\n\n> [!TIP]\n> go')
  await writeFile(join(from, 'guide/dog.png'), 'not really a png')

  await main([from, to])

  expect((await readdir(to)).sort()).toEqual(['guide', 'index.html'])
  expect((await readdir(join(to, 'guide'))).sort()).toEqual(['dog.png', 'start.html'])
  expect(await readFile(join(to, 'guide/start.html'), 'utf8')).toContain('bg-tip-container')
})
