import { describe, it, expect } from 'vitest'
import { compileMdxFrontmatter } from './compileMdxContent'

describe('compileMdxFrontmatter', () => {
  const relFilePath = '/test/file.mdx'
  const baseUrl = undefined

  it('compiles plain text correctly', async () => {
    const result = await compileMdxFrontmatter('Hello World', relFilePath, baseUrl)
    expect(result.content).toBeDefined()
  })

  it('compiles markdown links correctly', async () => {
    const result = await compileMdxFrontmatter('[link](#section)', relFilePath, baseUrl)
    expect(result.content).toBeDefined()
  })

  it('compiles inline code correctly', async () => {
    const result = await compileMdxFrontmatter('Use `code` here', relFilePath, baseUrl)
    expect(result.content).toBeDefined()
  })

  it('compiles bold and italic text correctly', async () => {
    const result = await compileMdxFrontmatter('**bold** and *italic*', relFilePath, baseUrl)
    expect(result.content).toBeDefined()
  })

  it('compiles multiple elements correctly', async () => {
    const result = await compileMdxFrontmatter(
      'Text with [link](#test) and `code` and **bold**',
      relFilePath,
      baseUrl,
    )
    expect(result.content).toBeDefined()
  })
})
