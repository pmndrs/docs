import { describe, it, expect } from 'vitest'
import { compileMdxFrontmatter, compileMdxContent } from './compileMdxContent'
import { renderToString } from 'react-dom/server'

describe('compileMdxFrontmatter', () => {
  const relFilePath = '/test/file.mdx'
  const baseUrl = undefined

  it('compiles plain text correctly', async () => {
    const result = await compileMdxFrontmatter('Hello World')
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toBe('Hello World')
  })

  it('compiles markdown links correctly', async () => {
    const result = await compileMdxFrontmatter('[link](#section)')
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(/<a[^>]*href="#section"[^>]*>link<\/a>/)
  })

  it('compiles inline code correctly', async () => {
    const result = await compileMdxFrontmatter('Use `code` here')
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(/Use <code[^>]*>code<\/code> here/)
  })

  it('compiles bold and italic text correctly', async () => {
    const result = await compileMdxFrontmatter('**bold** and *italic*')
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(/<strong>bold<\/strong> and <em>italic<\/em>/)
  })
})

describe('compileMdxContent', () => {
  const relFilePath = '/test/file.mdx'
  const absoluteFilePath = '/home/user/docs/test/file.mdx'
  const baseUrl = undefined
  const title = 'Test Title'
  const url = '/test/file'
  const tableOfContents: any[] = []
  const entries: any[] = []

  it('compiles full MDX content with text', async () => {
    const result = await compileMdxContent('This is **bold** text with *italic* formatting.', {
      relFilePath,
      absoluteFilePath,
      baseUrl,
      title,
      url,
      tableOfContents,
      entries,
    })
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(
      /<p[^>]*>This is <strong>bold<\/strong> text with <em>italic<\/em> formatting\.<\/p>/,
    )
  })

  it('compiles MDX with code blocks', async () => {
    const result = await compileMdxContent('```js\nconst x = 1;\n```', {
      relFilePath,
      absoluteFilePath,
      baseUrl,
      title,
      url,
      tableOfContents,
      entries,
    })
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    // Code blocks have complex HTML structure with syntax highlighting
    expect(html).toMatch(/<div[^>]*>/)
    expect(html).toMatch(/<pre[^>]*>/)
    expect(html).toMatch(/<code[^>]*>/)
    expect(html).toContain('const')
    expect(html).toContain('x')
    expect(html).toContain('1')
  })

  it('compiles MDX with links', async () => {
    const result = await compileMdxContent('Check [this link](#section)', {
      relFilePath,
      absoluteFilePath,
      baseUrl,
      title,
      url,
      tableOfContents,
      entries,
    })
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(/<p[^>]*>Check <a[^>]*href="#section"[^>]*>this link<\/a><\/p>/)
  })
})

/**
 * next-mdx-remote 6 strips every `{...}` expression unless `blockJS: false` is passed, which
 * silently drops props like `cols={2}` (#595). These fail if that option goes away.
 */
describe('MDX expressions', () => {
  const compile = async (source: string) => {
    const result = await compileMdxContent(source, {
      relFilePath: '/test/file.mdx',
      absoluteFilePath: '/home/user/docs/test/file.mdx',
      title: 'Test Title',
      url: '/test/file',
      tableOfContents: [],
      entries: [],
    })
    return renderToString(result.content)
  }

  it('evaluates inline expressions', async () => {
    expect(await compile('sum: {1+1}')).toMatch(/sum: (<!-- -->)?2/)
  })

  it('passes expression props to components', async () => {
    expect(await compile('<Grid cols={2}>\n  <div>a</div>\n</Grid>')).toContain('md:grid-cols-2')
  })

  it('passes array props to components', async () => {
    // `embed` skips the async `Img`, which `renderToString` cannot wait for
    const html = await compile(
      '<Codesandbox id="new" embed title="Demo" tags={["alpha", "beta"]} />',
    )
    expect(html).toMatch(/<span[^>]*>alpha<\/span>/)
    expect(html).toMatch(/<span[^>]*>beta<\/span>/)
  })

  it('evaluates expressions in frontmatter values', async () => {
    const result = await compileMdxFrontmatter('sum: {1+1}')
    expect(renderToString(result.content)).toMatch(/sum: (<!-- -->)?2/)
  })
})
