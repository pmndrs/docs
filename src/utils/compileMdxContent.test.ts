import { describe, it, expect } from 'vitest'
import { compileMdxFrontmatter } from './compileMdxContent'
import { renderToString } from 'react-dom/server'

describe('compileMdxFrontmatter', () => {
  const relFilePath = '/test/file.mdx'
  const baseUrl = undefined

  it('compiles plain text correctly', async () => {
    const result = await compileMdxFrontmatter('Hello World', relFilePath, baseUrl)
    expect(result.content).toBeDefined()
    const html = renderToString(result.content as React.ReactElement)
    expect(html).toContain('Hello World')
  })

  it('compiles markdown links correctly', async () => {
    const result = await compileMdxFrontmatter('[link](#section)', relFilePath, baseUrl)
    expect(result.content).toBeDefined()
    const html = renderToString(result.content as React.ReactElement)
    expect(html).toContain('href')
    expect(html).toContain('link')
  })

  it('compiles inline code correctly', async () => {
    const result = await compileMdxFrontmatter('Use `code` here', relFilePath, baseUrl)
    expect(result.content).toBeDefined()
    const html = renderToString(result.content as React.ReactElement)
    expect(html).toContain('code')
  })

  it('compiles bold and italic text correctly', async () => {
    const result = await compileMdxFrontmatter('**bold** and *italic*', relFilePath, baseUrl)
    expect(result.content).toBeDefined()
    const html = renderToString(result.content as React.ReactElement)
    expect(html).toContain('bold')
    expect(html).toContain('italic')
  })

  it('compiles multiple elements correctly', async () => {
    const result = await compileMdxFrontmatter(
      'Text with [link](#test) and `code` and **bold**',
      relFilePath,
      baseUrl,
    )
    expect(result.content).toBeDefined()
    const html = renderToString(result.content as React.ReactElement)
    expect(html).toContain('Text with')
    expect(html).toContain('link')
    expect(html).toContain('code')
    expect(html).toContain('bold')
  })

  it('compiles real-world frontmatter description with MDX', async () => {
    const result = await compileMdxFrontmatter(
      'Introduction component for **documentation** pages with `code` and [links](#test)',
      relFilePath,
      baseUrl,
    )
    expect(result.content).toBeDefined()
    const html = renderToString(result.content as React.ReactElement)
    expect(html).toContain('Introduction component for')
    expect(html).toContain('documentation')
    expect(html).toContain('code')
    expect(html).toContain('links')
  })
})
