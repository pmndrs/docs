import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, test, vi } from 'vitest'
import { compileMDX } from 'next-mdx-remote/rsc'
import { compileMdxContent, compileMdxFrontmatter } from './compileMdxContent'
import { getDocs } from './docs'
import { getData } from './site-docs'

vi.mock('pmndrs-docs-config', () => ({ default: { scope: { token: 'configured value' } } }))

vi.mock('./compileMdxContent', () => ({
  compileMdxContent: vi.fn(async (source, options) => {
    options.tableOfContents.push({ title: options.title, url: options.url })
    return { content: source }
  }),
  compileMdxFrontmatter: vi.fn(async (source) => ({ content: source })),
}))

vi.mock('next-mdx-remote/rsc', () => ({
  compileMDX: vi.fn(async () => ({ content: null })),
}))

const temporaryDirectories: string[] = []

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'pmndrs-docs-selection-'))
  temporaryDirectories.push(root)
  await Promise.all([
    writeFile(
      join(root, 'first.mdx'),
      '---\ntitle: First\ndescription: First description\nnav: 1\n---\nFirst body',
    ),
    writeFile(
      join(root, 'second.mdx'),
      '---\ntitle: Second\ndescription: Second description\nnav: 2\n---\nSecond body',
    ),
  ])
  return root
}

afterEach(async () => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
  await Promise.all(temporaryDirectories.splice(0).map((root) => rm(root, { recursive: true })))
})

test('compiles only the selected body while keeping all navigation metadata and entries', async () => {
  const docs = await getDocs(await fixture(), ['second'])

  expect(compileMdxContent).toHaveBeenCalledTimes(1)
  expect(compileMdxContent).toHaveBeenCalledWith(
    expect.stringContaining('Second body'),
    expect.objectContaining({
      entries: expect.arrayContaining([
        expect.objectContaining({ title: 'First', url: '/first' }),
        expect.objectContaining({ title: 'Second', url: '/second' }),
      ]),
    }),
  )
  expect(docs).toHaveLength(2)
  expect(docs[0]).toMatchObject({
    slug: ['first'],
    title: 'First',
    description: 'First description',
    metadata: { title: 'First', description: 'First description' },
    nav: 1,
    content: null,
    tableOfContents: [],
  })
  expect(docs[1].content).toContain('Second body')
  expect(docs[1].tableOfContents).toEqual([{ title: 'Second', url: '/second' }])
})

test('enumerates slugs without compiling titles or document bodies', async () => {
  const root = await fixture()
  await writeFile(join(root, 'invalid.mdx'), '<An unclosed JSX element')

  expect(await getDocs(root, null, true)).toEqual([
    { slug: ['first'] },
    { slug: ['second'] },
    { slug: ['invalid'] },
  ])
  expect(compileMdxFrontmatter).not.toHaveBeenCalled()
  expect(compileMDX).not.toHaveBeenCalled()
  expect(compileMdxContent).not.toHaveBeenCalled()
})

test('keeps every document body and search entry when fetching website page data', async () => {
  vi.stubEnv('MDX', await fixture())
  const { doc, docs } = await getData('second')

  expect(doc.url).toBe('/second')
  expect(compileMdxContent).toHaveBeenCalledTimes(2)
  expect(compileMdxContent).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ scope: { token: 'configured value' } }),
  )
  expect(docs.map(({ content }) => content)).toEqual([
    expect.stringContaining('First body'),
    expect.stringContaining('Second body'),
  ])
  expect(docs.flatMap(({ tableOfContents }) => tableOfContents)).toEqual([
    { title: 'First', url: '/first' },
    { title: 'Second', url: '/second' },
  ])
})

test('passes consumer scope and component overrides to the selected document compiler', async () => {
  const Custom = () => null
  const config = { scope: { size: 16 }, components: { Custom } }
  await getDocs(await fixture(), ['second'], false, config)

  expect(compileMdxContent).toHaveBeenCalledWith(
    expect.stringContaining('Second body'),
    expect.objectContaining(config),
  )
  expect(compileMDX).toHaveBeenCalledWith(
    expect.objectContaining({ options: expect.objectContaining({ scope: config.scope }) }),
  )
})
