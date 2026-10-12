import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it } from 'vitest'
import { renderFragment } from '@/cli/render'
import { parseDocsMetadata } from '@/utils/docs'

const folders: string[] = []
afterEach(async () => {
  await Promise.all(folders.map((folder) => rm(folder, { recursive: true, force: true })))
})

it('renders imported typed data and exports the local component as Markdown without changing source', async () => {
  const root = await mkdtemp(join(tmpdir(), 'docs-local-'))
  folders.push(root)
  await mkdir(join(root, 'docs'))
  await writeFile(
    join(root, 'data.ts'),
    'export const seeds = [{ name: "Lime", value: "#CAF543" }]',
  )
  await writeFile(
    join(root, 'Palette.tsx'),
    `import { defineMdxComponent } from '${join(process.cwd(), 'src/mdx.ts')}'
export const Palette = defineMdxComponent({
 component: ({ seeds }: { seeds: {name: string; value: string}[] }) => <div>{seeds[0].name}: {seeds[0].value}</div>,
 toMarkdown: ({ seeds }) => seeds.map(seed => '| ' + seed.name + ' | ' + seed.value + ' |').join('\\n')
})`,
  )
  const source = `---\ntitle: Colours\n---\n\nimport { seeds } from '../data'\nimport { Palette } from '../Palette'\n\n<Palette seeds={seeds} />\n`
  const file = join(root, 'docs/colours.mdx')
  await writeFile(file, source)
  expect(
    (await renderFragment(source, { absoluteFilePath: file })).replace(/<!-- -->/g, ''),
  ).toContain('#CAF543')
  const [doc] = await parseDocsMetadata(join(root, 'docs'))
  expect(doc.markdown).toContain('| Lime | #CAF543 |')
  expect(doc.markdown).not.toContain('import ')
  expect(doc.content).toContain('<Palette seeds={seeds} />')
})

it('rejects invalid imported component props before publication', async () => {
  const root = await mkdtemp(join(tmpdir(), 'docs-local-invalid-'))
  folders.push(root)
  await writeFile(
    join(root, 'Card.tsx'),
    `import { defineMdxComponent } from '@pmndrs/docs/mdx'
export const Card = defineMdxComponent({ component: ({ count }: { count: number }) => <p>{count}</p>, toMarkdown: ({count}) => String(count) })`,
  )
  await expect(
    renderFragment(`import { Card } from './Card'\n\n<Card count="wrong" />`, {
      absoluteFilePath: join(root, 'page.mdx'),
    }),
  ).rejects.toThrow('not assignable to type')
})

it('rejects local components without a Markdown representation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'docs-local-missing-'))
  folders.push(root)
  await writeFile(join(root, 'Card.tsx'), 'export function Card() { return <p>Hidden content</p> }')
  await expect(
    renderFragment(`import { Card } from './Card'\n\n<Card />`, {
      absoluteFilePath: join(root, 'page.mdx'),
    }),
  ).rejects.toThrow('must declare toMarkdown')
})

it('preserves existing built-in JSX expressions beside local components', async () => {
  const root = await mkdtemp(join(tmpdir(), 'docs-local-expression-'))
  folders.push(root)
  await writeFile(
    join(root, 'Card.tsx'),
    `import { defineMdxComponent } from '@pmndrs/docs/mdx'
export const Card = defineMdxComponent({ component: () => <p>Local content</p>, toMarkdown: () => 'Local content' })`,
  )
  const source = `import { Card } from './Card'\n\n<Card />\n\n{['primary'].map(role => (<Color name={role} value="#CAF543" />))}`
  expect(await renderFragment(source, { absoluteFilePath: join(root, 'page.mdx') })).toContain(
    'Local content',
  )
})

it('exports nested local content through a local layout converter', async () => {
  const root = await mkdtemp(join(tmpdir(), 'docs-local-layout-'))
  folders.push(root)
  await writeFile(
    join(root, 'Card.tsx'),
    `import { defineMdxComponent } from '@pmndrs/docs/mdx'
import type { ReactNode } from 'react'
export const Layout = defineMdxComponent({ component: ({children}: {children: ReactNode}) => <section>{children}</section>, toMarkdown: ({children}) => String(children) })
export const Card = defineMdxComponent({ component: () => <p>Local content</p>, toMarkdown: () => 'Converted nested content' })`,
  )
  const source = `import { Card, Layout } from './Card'\n\n<Layout>\n\n## Heading\n\n<Card />\n\n</Layout>`
  const file = join(root, 'page.mdx')
  await writeFile(file, source)
  const [doc] = await parseDocsMetadata(root)
  expect(doc.markdown).toContain('## Heading')
  expect(doc.markdown).toContain('Converted nested content')
  expect(doc.markdown).not.toContain('<Card')
})
