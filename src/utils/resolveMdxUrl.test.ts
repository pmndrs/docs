import { describe, it, expect } from 'vitest'
import resolveMdxUrl from './resolveMdxUrl'

describe('resolveMdxUrl', () => {
  const baseUrl = 'http://localhost:8080/foo/bar'

  describe('with absolute mdFile path (/getting-started/tutorials/store.mdx)', () => {
    const mdFile = '/getting-started/tutorials/store.mdx'

    it('resolves relative path without ./', () => {
      expect(resolveMdxUrl('dog.png', mdFile, baseUrl)).toBe(
        `${baseUrl}/getting-started/tutorials/dog.png`,
      )
    })

    it('resolves relative path with ./', () => {
      expect(resolveMdxUrl('./dog.png', mdFile, baseUrl)).toBe(
        `${baseUrl}/getting-started/tutorials/dog.png`,
      )
    })

    it('resolves parent directory path with ../', () => {
      expect(resolveMdxUrl('../dog.png', mdFile, baseUrl)).toBe(
        `${baseUrl}/getting-started/dog.png`,
      )
    })

    it('resolves multiple parent directory levels', () => {
      expect(resolveMdxUrl('../../../../../../dog.png', mdFile, baseUrl)).toBe(`${baseUrl}/dog.png`)
    })

    it('resolves absolute path starting with /', () => {
      expect(resolveMdxUrl('/dog.png', mdFile, baseUrl)).toBe(`${baseUrl}/dog.png`)
    })

    it('resolves absolute path with multiple directories', () => {
      expect(resolveMdxUrl('/my/beautiful/dog.png', mdFile, baseUrl)).toBe(
        `${baseUrl}/my/beautiful/dog.png`,
      )
    })

    it('returns fully qualified URL unchanged', () => {
      expect(resolveMdxUrl('http://example.org/dog.png', mdFile, baseUrl)).toBe(
        'http://example.org/dog.png',
      )
    })
  })

  describe('with relative mdFile path (getting-started/tutorials/store.mdx)', () => {
    const mdFile = 'getting-started/tutorials/store.mdx'

    it('resolves relative path without ./', () => {
      expect(resolveMdxUrl('dog.png', mdFile, baseUrl)).toBe(
        `${baseUrl}/getting-started/tutorials/dog.png`,
      )
    })

    it('resolves relative path with ./', () => {
      expect(resolveMdxUrl('./dog.png', mdFile, baseUrl)).toBe(
        `${baseUrl}/getting-started/tutorials/dog.png`,
      )
    })

    it('resolves parent directory path with ../', () => {
      expect(resolveMdxUrl('../dog.png', mdFile, baseUrl)).toBe(
        `${baseUrl}/getting-started/dog.png`,
      )
    })

    it('resolves multiple parent directory levels', () => {
      expect(resolveMdxUrl('../../../../../../dog.png', mdFile, baseUrl)).toBe(`${baseUrl}/dog.png`)
    })

    it('resolves absolute path starting with /', () => {
      expect(resolveMdxUrl('/dog.png', mdFile, baseUrl)).toBe(`${baseUrl}/dog.png`)
    })

    it('returns fully qualified URL unchanged', () => {
      expect(resolveMdxUrl('http://example.org/dog.png', mdFile, baseUrl)).toBe(
        'http://example.org/dog.png',
      )
    })
  })

  describe('edge cases with mdFile containing parent references', () => {
    it('handles mdFile with single parent reference', () => {
      expect(resolveMdxUrl('dog.png', '../getting-started/tutorials/store.mdx', baseUrl)).toBe(
        `${baseUrl}/getting-started/tutorials/dog.png`,
      )
    })

    it('handles mdFile with double parent reference', () => {
      expect(resolveMdxUrl('dog.png', '../../getting-started/tutorials/store.mdx', baseUrl)).toBe(
        `${baseUrl}/getting-started/tutorials/dog.png`,
      )
    })

    it('handles mdFile with double parent reference and src with parent reference', () => {
      expect(
        resolveMdxUrl('../dog.png', '../../getting-started/tutorials/store.mdx', baseUrl),
      ).toBe(`${baseUrl}/getting-started/dog.png`)
    })

    it('handles deeply nested parent references in both src and mdFile', () => {
      expect(
        resolveMdxUrl(
          '../../../../../../../dog.png',
          '../../../../../../../getting-started/tutorials/store.mdx',
          baseUrl,
        ),
      ).toBe(`${baseUrl}/dog.png`)
    })
  })

  describe('without baseUrl', () => {
    it('returns the src unchanged when baseUrl is not provided', () => {
      expect(resolveMdxUrl('dog.png', '/getting-started/tutorials/store.mdx')).toBe('dog.png')
    })

    it('returns fully qualified URL unchanged when baseUrl is not provided', () => {
      expect(
        resolveMdxUrl('http://example.org/dog.png', '/getting-started/tutorials/store.mdx'),
      ).toBe('http://example.org/dog.png')
    })
  })

  describe('with fully qualified URLs', () => {
    it('returns fully qualified URL unchanged regardless of baseUrl', () => {
      expect(resolveMdxUrl('https://example.com/image.png', '/path/to/file.mdx', baseUrl)).toBe(
        'https://example.com/image.png',
      )
    })
  })
})
