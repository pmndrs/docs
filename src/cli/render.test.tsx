import { mkdtemp, readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { load } from 'cheerio'
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
  ['Gha', '> [!NOTE]\n> hello', 'Note'],
  ['Hint', '<Hint>hi</Hint>', 'hi'],
  ['Code', '```js\nconst a = 1\n```', 'language-js'],
  ['Mermaid', '```mermaid\ngraph TD;\nA-->B;\n```', 'graph TD;'],
  ['Keypoints', '<Keypoints><KeypointsItem>a</KeypointsItem></Keypoints>', 'Keypoints'],
  ['Steps', '<Steps>\n\n<Step>One</Step>\n\nbody\n\n</Steps>', '[counter-reset:step]'],
  ['Grid', '<Grid cols={2}>\n  <div>a</div>\n</Grid>', 'grid-list'],
  ['Intro', '<Intro>lead</Intro>', 'lead'],
  ['Img', '![a dog](dog.png)', '<img'],
  ['Codesandbox', '<Codesandbox id="new" />', 'codesandbox'],
  ['Details', '<details>\n  <summary>s</summary>\n\nbody\n\n</details>', '<details'],
  ['heading anchors', '## Section one', 'id="section-one"'],
])('renders %s', async (_name, source, marker) => {
  expect(await render(source)).toContain(marker)
})

test.each([
  ['NOTE', 'Note'],
  ['TIP', 'Tip'],
  ['IMPORTANT', 'Important'],
  ['WARNING', 'Warning'],
  ['CAUTION', 'Caution'],
])('exports a static %s editorial note with rich Markdown', async (keyword, title) => {
  const $ = load(
    await render(
      `> [!${keyword}]\n> Read **carefully** and [continue](https://example.com/guide).\n>\n> - First takeaway\n> - Second takeaway`,
    ),
  )
  const note = $('[role="note"]')
  expect(note).toHaveLength(1)
  expect(note.text()).toContain(title)
  expect(note.find('strong').text()).toBe('carefully')
  expect(note.find('a').attr('href')).toBe('https://example.com/guide')
  expect(
    note
      .find('li')
      .map((_, item) => $(item).text())
      .get(),
  ).toEqual(['First takeaway', 'Second takeaway'])
  expect($('[role="alert"]')).toHaveLength(0)
})

test('keeps custom callout labels, unknown-kind fallback and the deprecated Hint adapter', async () => {
  const $ = load(
    await render(
      '<Gha keyword="UNKNOWN" title="Local advice">Read this advice</Gha>\n\n<Hint>Legacy note</Hint>',
    ),
  )
  expect($('[role="note"][aria-label="Local advice"]').text()).toContain('Read this advice')
  expect($('[role="note"][aria-label="Note"]').text()).toContain('Legacy note')
  expect($('[role="alert"]')).toHaveLength(0)
})

test('exports a full custom callout label with headings, code and nested lists', async () => {
  const title =
    'Before sharing a sandbox, check its dependencies and document the environment needed to reproduce the example'
  const $ = load(
    await render(`<Gha keyword="TIP" title="${title}">

### Reproduce the example

Run **locally** before sharing.

\`\`\`sh
pnpm install
pnpm dev
\`\`\`

- Document the requirements.
  - Include the supported Node.js version.
- Read the [sandbox examples](codesandbox).

</Gha>`),
  )
  const note = $('[role="note"]')
  expect(note.attr('aria-label')).toBe(title)
  expect(note.text()).toContain(title)
  expect(note.find('h3').text()).toBe('Reproduce the example')
  expect(note.find('p strong').text()).toBe('locally')
  expect(note.find('pre code').text()).toContain('pnpm install\npnpm dev')
  expect(note.find('ul ul li').text()).toBe('Include the supported Node.js version.')
  expect(note.find('a[href="codesandbox"]')).toHaveLength(1)
  expect(note.find('p p, p pre, p ul')).toHaveLength(0)
})

test('exports sandbox metadata and a meaningful destination without a title or image', async () => {
  const $ = load(
    await render(
      '<Codesandbox id="physics-example" description="A physics demo" tags={["physics", "rapier"]} />',
    ),
  )
  const preview = $('a[aria-label="CodeSandbox physics-example"]')
  expect(preview.attr('href')).toBe('https://codesandbox.io/s/physics-example')
  expect(preview.attr('target')).toBe('_blank')
  expect(preview.find('img')).toHaveLength(0)
  expect($.text()).toContain('A physics demo')
  expect($.text()).toContain('physics')
  expect($.text()).toContain('rapier')
  expect($('a a, a button, button a')).toHaveLength(0)
})

test.each([
  ['img="https://example.com/preview.webp"', 'https://example.com/preview.webp'],
  ['screenshot_url="https://example.com/legacy.webp"', 'https://example.com/legacy.webp'],
  [
    'img="https://example.com/preview.webp" screenshot_url="https://example.com/legacy.webp"',
    'https://example.com/preview.webp',
  ],
])('exports sandbox preview image compatibility for %s', async (props, source) => {
  const $ = load(await render(`<Codesandbox id="image-example" title="Image demo" ${props} />`))
  const preview = $('a[aria-label="Image demo"]')
  expect(preview.attr('href')).toBe('https://codesandbox.io/s/image-example')
  expect(preview.find('img').attr('src')).toBe(source)
  expect(preview.find('img').attr('alt')).toBe('Image demo')
  expect($('h6').text()).toBe('Image demo')
})

test('exports the sandbox iframe permissions and caption unchanged', async () => {
  const $ = load(
    await render(
      '<Codesandbox id="live-example" title="Live demo" embed description="Interactive demo" tags={["live"]} />',
    ),
  )
  const embed = $('iframe')
  expect(embed.attr('src')).toBe('https://codesandbox.io/embed/live-example')
  expect(embed.attr('title')).toBe('Live demo')
  expect(embed.attr('sandbox')).toBe(
    'allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts',
  )
  expect(embed.attr('allow')).toBe(
    'accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking',
  )
  expect($('h6').text()).toBe('Live demo')
  expect($.text()).toContain('Interactive demo')
  expect($.text()).toContain('live')
  expect($('a[href="https://codesandbox.io/s/live-example"]')).toHaveLength(0)
})

/**
 * The numbers are styled on the `Steps` wrapper's direct `h3` children: a `Step` wrapped in a
 * `<p>` would lose its number. Both the flat form and the indented one the docs teach.
 */
test.each([
  ['flat', '<Steps>\n\n<Step>One</Step>\n\nbody\n\n</Steps>'],
  ['indented', '<Steps>\n\n  <Step>One</Step>\n\n  body\n\n</Steps>'],
])('renders a %s Step as a direct h3 child of Steps', async (_name, source) => {
  expect(await render(source)).toMatch(/\[counter-reset:step\][^"]*"><h3[^>]*>One<\/h3>/)
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

  await main(['build', from, to])

  expect((await readdir(to)).sort()).toEqual(['guide', 'index.html'])
  expect((await readdir(join(to, 'guide'))).sort()).toEqual(['dog.png', 'start.html'])
  expect(
    load(await readFile(join(to, 'guide/start.html'), 'utf8'))('[role="note"]').text(),
  ).toContain('Tip')
})
