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
    expect(html).toBe('<p class="my-4">Hello World</p>')
  })

  it('compiles markdown links correctly', async () => {
    const result = await compileMdxFrontmatter('[link](#section)', relFilePath, baseUrl)
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toBe('<p class="my-4"><a href="#section" class="text-primary">link</a></p>')
  })

  it('compiles inline code correctly', async () => {
    const result = await compileMdxFrontmatter('Use `code` here', relFilePath, baseUrl)
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toBe(
      '<p class="my-4">Use <code class="bg-surface-container-high rounded-md px-1.5 py-0.5 font-mono text-[85%]">code</code> here</p>',
    )
  })

  it('compiles bold and italic text correctly', async () => {
    const result = await compileMdxFrontmatter('**bold** and *italic*', relFilePath, baseUrl)
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toBe('<p class="my-4"><strong>bold</strong> and <em>italic</em></p>')
  })

  it('compiles multiple elements correctly', async () => {
    const result = await compileMdxFrontmatter(
      'Text with [link](#test) and `code` and **bold**',
      relFilePath,
      baseUrl,
    )
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toBe(
      '<p class="my-4">Text with <a href="#test" class="text-primary">link</a> and <code class="bg-surface-container-high rounded-md px-1.5 py-0.5 font-mono text-[85%]">code</code> and <strong>bold</strong></p>',
    )
  })

  it('compiles real-world frontmatter description with MDX', async () => {
    const result = await compileMdxFrontmatter(
      'Introduction component for **documentation** pages with `code` and [links](#test)',
      relFilePath,
      baseUrl,
    )
    expect(result.content).toBeDefined()
    const html = renderToString(result.content)
    expect(html).toBe(
      '<p class="my-4">Introduction component for <strong>documentation</strong> pages with <code class="bg-surface-container-high rounded-md px-1.5 py-0.5 font-mono text-[85%]">code</code> and <a href="#test" class="text-primary">links</a></p>',
    )
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
    expect(html).toBe(
      '<p class="my-4">This is <strong>bold</strong> text with <em>italic</em> formatting.</p>',
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
    expect(html).toContain('<div class="relative">')
    expect(html).toContain('<pre class="language-js')
    expect(html).toContain('<code class="language-js code-highlight">')
    expect(html).toContain('<span class="token keyword">const</span>')
    expect(html).toContain('<span class="token number">1</span>')
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
    expect(html).toBe(
      '<p class="my-4">Check <a href="#section" class="text-primary">this link</a></p>',
    )
  })
})
