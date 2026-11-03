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

    it('returns a URL of any scheme unchanged', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgo='
      expect(resolveMdxUrl(dataUrl, '/path/to/file.mdx', baseUrl)).toBe(dataUrl)
      expect(resolveMdxUrl('blob:https://example.com/1234', '/path/to/file.mdx', baseUrl)).toBe(
        'blob:https://example.com/1234',
      )
    })

    it('returns a protocol-relative URL unchanged', () => {
      expect(resolveMdxUrl('//example.com/image.png', '/path/to/file.mdx', baseUrl)).toBe(
        '//example.com/image.png',
      )
    })
  })

  /**
   * Characterization of the absolute `MDX_BASEURL` outputs, written against the code before a
   * path-only base was accepted: they must not change.
   */
  describe('absolute base, unchanged', () => {
    const mdFile = 'advanced/introduction.mdx'

    it('resolves `.`, `./` and `..` against the page', () => {
      expect(resolveMdxUrl('.', mdFile, baseUrl)).toBe(`${baseUrl}/advanced`)
      expect(resolveMdxUrl('./', mdFile, baseUrl)).toBe(`${baseUrl}/advanced`)
      expect(resolveMdxUrl('..', mdFile, baseUrl)).toBe(`${baseUrl}/`)
      expect(resolveMdxUrl('./sub/../dog.png', mdFile, baseUrl)).toBe(`${baseUrl}/advanced/dog.png`)
    })

    it('keeps a query and a hash, and percent-encodes the path', () => {
      expect(resolveMdxUrl('dog.png?v=1#top', mdFile, baseUrl)).toBe(
        `${baseUrl}/advanced/dog.png?v=1#top`,
      )
      expect(resolveMdxUrl('my dog.png', mdFile, baseUrl)).toBe(`${baseUrl}/advanced/my%20dog.png`)
    })

    it('resolves against a base without a path', () => {
      expect(resolveMdxUrl('dog.png', mdFile, 'http://localhost:60141')).toBe(
        'http://localhost:60141/advanced/dog.png',
      )
      expect(resolveMdxUrl('/dog.png', mdFile, 'http://localhost:60141')).toBe(
        'http://localhost:60141/dog.png',
      )
    })

    it('keeps the double slash a trailing slash on the base gives', () => {
      expect(resolveMdxUrl('dog.png', mdFile, 'https://example.com/docs/')).toBe(
        'https://example.com/docs//advanced/dog.png',
      )
    })

    it('resolves against a GitHub raw base', () => {
      const github = 'https://github.com/pmndrs/docs/raw/main/docs'
      expect(resolveMdxUrl('dog.png', mdFile, github)).toBe(`${github}/advanced/dog.png`)
      expect(resolveMdxUrl('../shots/a.png', mdFile, github)).toBe(`${github}/shots/a.png`)
    })

    it('leaves a URL with a scheme or protocol-relative as is', () => {
      for (const src of [
        'https://example.com/a.png',
        'HTTP://EXAMPLE.COM/A.PNG',
        'data:image/png;base64,iVBORw0KGgo=',
        'mailto:a@example.com',
        '//example.com/a.png',
      ]) {
        expect(resolveMdxUrl(src, mdFile, baseUrl)).toBe(src)
      }
    })

    it('returns the src as is with an empty base', () => {
      for (const src of ['dog.png', '/dog.png', '../dog.png', '.']) {
        expect(resolveMdxUrl(src, mdFile, '')).toBe(src)
        expect(resolveMdxUrl(src, mdFile, undefined)).toBe(src)
      }
    })
  })
})
