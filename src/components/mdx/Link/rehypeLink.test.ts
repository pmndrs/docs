import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import { rehypeLink } from './rehypeLink'

describe('rehypeLink', () => {
  const BASE_PATH = '/react-three-fiber'

  async function processHtml(html: string, basePath: string | undefined) {
    const processor = unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeLink(basePath))
      .use(rehypeStringify)

    const result = await processor.process(html)
    return String(result).trim()
  }

  describe('with BASE_PATH set', () => {
    it('prepends BASE_PATH to absolute path starting with /', async () => {
      const html = '<a href="/docs/introduction">Link</a>'
      const result = await processHtml(html, BASE_PATH)
      expect(result).toBe(`<a href="${BASE_PATH}/docs/introduction">Link</a>`)
    })

    it('prepends BASE_PATH to multiple absolute paths', async () => {
      const html = '<div><a href="/docs">Docs</a> <a href="/guide">Guide</a></div>'
      const result = await processHtml(html, BASE_PATH)
      expect(result).toBe(
        `<div><a href="${BASE_PATH}/docs">Docs</a> <a href="${BASE_PATH}/guide">Guide</a></div>`,
      )
    })

    it('prepends BASE_PATH to root path', async () => {
      const html = '<a href="/">Home</a>'
      const result = await processHtml(html, BASE_PATH)
      expect(result).toBe(`<a href="${BASE_PATH}/">Home</a>`)
    })

    it('leaves external links unchanged', async () => {
      const html = '<a href="https://example.com">External</a>'
      const result = await processHtml(html, BASE_PATH)
      expect(result).toBe('<a href="https://example.com">External</a>')
    })

    it('leaves external http links unchanged', async () => {
      const html = '<a href="http://example.com/page">External</a>'
      const result = await processHtml(html, BASE_PATH)
      expect(result).toBe('<a href="http://example.com/page">External</a>')
    })

    it('leaves relative path unchanged', async () => {
      const html = '<a href="./docs">Relative</a>'
      const result = await processHtml(html, BASE_PATH)
      expect(result).toBe('<a href="./docs">Relative</a>')
    })

    it('leaves parent directory path unchanged', async () => {
      const html = '<a href="../docs">Parent</a>'
      const result = await processHtml(html, BASE_PATH)
      expect(result).toBe('<a href="../docs">Parent</a>')
    })

    it('leaves anchor link unchanged', async () => {
      const html = '<a href="#section">Anchor</a>'
      const result = await processHtml(html, BASE_PATH)
      expect(result).toBe('<a href="#section">Anchor</a>')
    })

    it('leaves mailto link unchanged', async () => {
      const html = '<a href="mailto:test@example.com">Email</a>'
      const result = await processHtml(html, BASE_PATH)
      expect(result).toBe('<a href="mailto:test@example.com">Email</a>')
    })

    it('handles links without href attribute', async () => {
      const html = '<a>No href</a>'
      const result = await processHtml(html, BASE_PATH)
      expect(result).toBe('<a>No href</a>')
    })

    it('handles nested absolute links', async () => {
      const html = '<div><p><a href="/nested/link">Nested</a></p></div>'
      const result = await processHtml(html, BASE_PATH)
      expect(result).toBe(`<div><p><a href="${BASE_PATH}/nested/link">Nested</a></p></div>`)
    })
  })

  describe('without BASE_PATH (undefined)', () => {
    it('leaves absolute path unchanged when BASE_PATH is undefined', async () => {
      const html = '<a href="/docs">Link</a>'
      const result = await processHtml(html, undefined)
      expect(result).toBe('<a href="/docs">Link</a>')
    })

    it('leaves all links unchanged when BASE_PATH is undefined', async () => {
      const html =
        '<div><a href="/abs">Abs</a> <a href="https://ext.com">Ext</a> <a href="./rel">Rel</a></div>'
      const result = await processHtml(html, undefined)
      expect(result).toBe(
        '<div><a href="/abs">Abs</a> <a href="https://ext.com">Ext</a> <a href="./rel">Rel</a></div>',
      )
    })
  })

  describe('without BASE_PATH (empty string)', () => {
    it('leaves absolute path unchanged when BASE_PATH is empty', async () => {
      const html = '<a href="/docs">Link</a>'
      const result = await processHtml(html, '')
      expect(result).toBe('<a href="/docs">Link</a>')
    })
  })

  describe('with different BASE_PATH values', () => {
    it('works with single segment BASE_PATH', async () => {
      const html = '<a href="/docs">Link</a>'
      const result = await processHtml(html, '/zustand')
      expect(result).toBe('<a href="/zustand/docs">Link</a>')
    })

    it('works with multi-segment BASE_PATH', async () => {
      const html = '<a href="/api">Link</a>'
      const result = await processHtml(html, '/project/subproject')
      expect(result).toBe('<a href="/project/subproject/api">Link</a>')
    })

    it('works with BASE_PATH without leading slash', async () => {
      const html = '<a href="/docs">Link</a>'
      const result = await processHtml(html, 'base')
      expect(result).toBe('<a href="base/docs">Link</a>')
    })
  })

  describe('complex HTML structures', () => {
    it('handles mixed link types in complex HTML', async () => {
      const html = `
        <article>
          <nav>
            <a href="/home">Home</a>
            <a href="https://external.com">External</a>
            <a href="#top">Top</a>
          </nav>
          <section>
            <p>Text with <a href="/inline">inline link</a></p>
          </section>
        </article>
      `
      const result = await processHtml(html, BASE_PATH)
      expect(result).toContain(`href="${BASE_PATH}/home"`)
      expect(result).toContain('href="https://external.com"')
      expect(result).toContain('href="#top"')
      expect(result).toContain(`href="${BASE_PATH}/inline"`)
    })

    it('preserves link attributes', async () => {
      const html = '<a href="/docs" class="link" target="_blank" rel="noopener">Link</a>'
      const result = await processHtml(html, BASE_PATH)
      expect(result).toContain(`href="${BASE_PATH}/docs"`)
      expect(result).toContain('class="link"')
      expect(result).toContain('target="_blank"')
      expect(result).toContain('rel="noopener"')
    })
  })
})
