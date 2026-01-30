import { describe, it, expect } from 'vitest'
import { compileMdxFrontmatter, compileMdxContent } from './compileMdxContent'
import { renderToString } from 'react-dom/server'

describe('compileMdxFrontmatter', () => {
  const relFilePath = '/test/file.mdx'
  const baseUrl = undefined

  it('compiles plain text correctly', async () => {
    const result = await compileMdxFrontmatter('Hello World', relFilePath, baseUrl)
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(/<p[^>]*>Hello World<\/p>/)
  })

  it('compiles markdown links correctly', async () => {
    const result = await compileMdxFrontmatter('[link](#section)', relFilePath, baseUrl)
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(/<p[^>]*><a[^>]*href="#section"[^>]*>link<\/a><\/p>/)
  })

  it('compiles inline code correctly', async () => {
    const result = await compileMdxFrontmatter('Use `code` here', relFilePath, baseUrl)
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(/<p[^>]*>Use <code[^>]*>code<\/code> here<\/p>/)
  })

  it('compiles bold and italic text correctly', async () => {
    const result = await compileMdxFrontmatter('**bold** and *italic*', relFilePath, baseUrl)
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(/<p[^>]*><strong>bold<\/strong> and <em>italic<\/em><\/p>/)
  })

  it('compiles multiple elements correctly', async () => {
    const result = await compileMdxFrontmatter(
      'Text with [link](#test) and `code` and **bold**',
      relFilePath,
      baseUrl,
    )
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(/<p[^>]*>Text with <a[^>]*href="#test"[^>]*>link<\/a>/)
    expect(html).toContain('<code')
    expect(html).toContain('>code</code>')
    expect(html).toContain('<strong>bold</strong>')
  })

  it('compiles real-world frontmatter description with MDX', async () => {
    const result = await compileMdxFrontmatter(
      'Introduction component for **documentation** pages with `code` and [links](#test)',
      relFilePath,
      baseUrl,
    )
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(/<p[^>]*>Introduction component for <strong>documentation<\/strong>/)
    expect(html).toContain('pages with')
    expect(html).toContain('<code')
    expect(html).toContain('>code</code>')
    expect(html).toMatch(/<a[^>]*href="#test"[^>]*>links<\/a>/)
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
    const result = await compileMdxContent(
      'This is **bold** text with *italic* formatting.',
      relFilePath,
      absoluteFilePath,
      baseUrl,
      title,
      url,
      tableOfContents,
      entries,
    )
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(
      /<p[^>]*>This is <strong>bold<\/strong> text with <em>italic<\/em> formatting\.<\/p>/,
    )
  })

  it('compiles MDX with code blocks', async () => {
    const result = await compileMdxContent(
      '```js\nconst x = 1;\n```',
      relFilePath,
      absoluteFilePath,
      baseUrl,
      title,
      url,
      tableOfContents,
      entries,
    )
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
    const result = await compileMdxContent(
      'Check [this link](#section)',
      relFilePath,
      absoluteFilePath,
      baseUrl,
      title,
      url,
      tableOfContents,
      entries,
    )
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toMatch(/<p[^>]*>Check <a[^>]*href="#section"[^>]*>this link<\/a><\/p>/)
  })
})
