import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { compileMDX } from 'next-mdx-remote/rsc'
import { afterEach, expect, test, vi } from 'vitest'
import { compileMdxContent, compileMdxFrontmatter } from '@/utils/compileMdxContent'
import FragmentDocumentPage from './page'

vi.mock('@/fragments/config', () => ({ fragmentConfig: {} }))
vi.mock('@/utils/compileMdxContent', () => ({
  compileMdxContent: vi.fn(async (_source, { url }) => ({ content: <article data-url={url} /> })),
  compileMdxFrontmatter: vi.fn(async (source) => ({ content: source })),
}))
vi.mock('next-mdx-remote/rsc', () => ({
  compileMDX: vi.fn(async () => ({ content: null })),
}))

afterEach(() => {
  vi.unstubAllEnvs()
})

test('shares corpus compilation across concurrent and repeated fragment pages', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pmndrs-fragment-pages-'))
  try {
    await Promise.all(
      ['first', 'second'].map((slug) =>
        writeFile(join(root, `${slug}.mdx`), `---\ntitle: ${slug}\n---\nBody`),
      ),
    )
    vi.stubEnv('MDX', root)

    const pages = await Promise.all(
      ['first', 'second'].map((slug) =>
        FragmentDocumentPage({ params: Promise.resolve({ slug: [slug] }) }),
      ),
    )
    const repeated = await FragmentDocumentPage({
      params: Promise.resolve({ slug: ['second'] }),
    })

    expect(pages.map((page) => page.props.children.props['data-url'])).toEqual([
      '/first',
      '/second',
    ])
    expect(repeated.props.children.props['data-url']).toBe('/second')
    // Count the metadata/CodeSandbox scan too, not only final body compilation.
    expect(compileMDX).toHaveBeenCalledTimes(2)
    expect(compileMdxFrontmatter).toHaveBeenCalledTimes(2)
    expect(compileMdxContent).toHaveBeenCalledTimes(2)
    expect(compileMdxContent).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        entries: expect.arrayContaining([
          expect.objectContaining({ title: 'first', url: '/first', boxes: [] }),
          expect.objectContaining({ title: 'second', url: '/second', boxes: [] }),
        ]),
      }),
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
