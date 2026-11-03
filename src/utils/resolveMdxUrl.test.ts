import { describe, it, expect } from 'vitest'
import path from 'node:path'
import resolveMdxUrl, { isPathBaseUrl, mdxFilePath, socialImageUrl } from './resolveMdxUrl'

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

  describe('path-only base', () => {
    const mdFile = 'advanced/introduction.mdx'

    it('gives a root-relative URL under the base path', () => {
      expect(resolveMdxUrl('dog.png', mdFile, '/integral')).toBe('/integral/advanced/dog.png')
      expect(resolveMdxUrl('./dog.png', mdFile, '/integral')).toBe('/integral/advanced/dog.png')
      expect(resolveMdxUrl('../x.png', mdFile, '/integral')).toBe('/integral/x.png')
      expect(resolveMdxUrl('../../../x.png', mdFile, '/integral')).toBe('/integral/x.png')
      expect(resolveMdxUrl('/foo/x.png', mdFile, '/integral')).toBe('/integral/foo/x.png')
      expect(resolveMdxUrl('dog.png', '/advanced/introduction.mdx', '/integral')).toBe(
        '/integral/advanced/dog.png',
      )
    })

    it('ignores a trailing slash on the base', () => {
      expect(resolveMdxUrl('dog.png', mdFile, '/integral/')).toBe('/integral/advanced/dog.png')
      expect(resolveMdxUrl('/foo/x.png', mdFile, '/integral//')).toBe('/integral/foo/x.png')
    })

    it('takes `/` as the root', () => {
      expect(resolveMdxUrl('dog.png', mdFile, '/')).toBe('/advanced/dog.png')
      expect(resolveMdxUrl('/foo/x.png', mdFile, '/')).toBe('/foo/x.png')
      expect(resolveMdxUrl('../x.png', mdFile, '/')).toBe('/x.png')
    })

    it('resolves `.` and `..`, and keeps a query and a hash, like an absolute base', () => {
      expect(resolveMdxUrl('.', mdFile, '/integral')).toBe('/integral/advanced')
      expect(resolveMdxUrl('..', mdFile, '/integral')).toBe('/integral/')
      expect(resolveMdxUrl('dog.png?v=1#top', mdFile, '/integral')).toBe(
        '/integral/advanced/dog.png?v=1#top',
      )
      expect(resolveMdxUrl('my dog.png', mdFile, '/integral')).toBe(
        '/integral/advanced/my%20dog.png',
      )
    })

    it('leaves a URL with a scheme or protocol-relative as is', () => {
      for (const src of [
        'https://example.com/a.png',
        'data:image/png;base64,iVBORw0KGgo=',
        '//example.com/a.png',
      ]) {
        expect(resolveMdxUrl(src, mdFile, '/integral')).toBe(src)
      }
    })

    it('matches the path of the same base made absolute', () => {
      for (const src of ['dog.png', './dog.png', '../x.png', '/foo/x.png', '.', 'a b.png?q#h']) {
        const absolute = new URL(resolveMdxUrl(src, mdFile, 'https://example.com/integral'))
        expect(resolveMdxUrl(src, mdFile, '/integral')).toBe(
          `${absolute.pathname}${absolute.search}${absolute.hash}`,
        )
      }
    })
  })
})

describe('isPathBaseUrl', () => {
  it('tells a path from an absolute or protocol-relative URL', () => {
    expect(isPathBaseUrl('/')).toBe(true)
    expect(isPathBaseUrl('/integral')).toBe(true)
    expect(isPathBaseUrl('/integral/')).toBe(true)
    expect(isPathBaseUrl('http://localhost:60141')).toBe(false)
    expect(isPathBaseUrl('https://github.com/pmndrs/docs/raw/main/docs')).toBe(false)
    expect(isPathBaseUrl('//example.com')).toBe(false)
  })
})

describe('mdxFilePath', () => {
  const MDX = '/home/me/docs'

  it('maps a URL under an absolute base the way `Img` always did', () => {
    const base = 'http://localhost:60141'
    expect(mdxFilePath(`${base}/advanced/dog.png`, base, MDX)).toBe(
      path.resolve(`${MDX}/advanced/dog.png`),
    )
    expect(mdxFilePath('https://example.com/a.png', base, MDX)).toBeUndefined()
    expect(mdxFilePath('/advanced/dog.png', base, MDX)).toBeUndefined()
  })

  it('maps nothing without a base', () => {
    expect(mdxFilePath('http://localhost:60141/a.png', undefined, MDX)).toBeUndefined()
    expect(mdxFilePath('/a.png', '', MDX)).toBeUndefined()
  })

  it('maps a root-relative URL under a path-only base', () => {
    for (const base of ['/integral', '/integral/']) {
      expect(mdxFilePath('/integral/advanced/dog.png', base, MDX)).toBe(`${MDX}/advanced/dog.png`)
      expect(mdxFilePath('/integral/dog.png', base, MDX)).toBe(`${MDX}/dog.png`)
    }
  })

  it('maps a root-relative URL under `/`, keeping the separator', () => {
    expect(mdxFilePath('/advanced/dog.png', '/', MDX)).toBe(`${MDX}/advanced/dog.png`)
    expect(mdxFilePath('/dog.png', '/', MDX)).toBe(`${MDX}/dog.png`)
  })

  it('drops the query and hash, and decodes the path, under a path-only base', () => {
    expect(mdxFilePath('/integral/my%20dog.png?v=1#top', '/integral', MDX)).toBe(
      `${MDX}/my dog.png`,
    )
  })

  it('maps nothing outside a path-only base', () => {
    expect(mdxFilePath('/integralx/dog.png', '/integral', MDX)).toBeUndefined()
    expect(mdxFilePath('/other/dog.png', '/integral', MDX)).toBeUndefined()
    expect(mdxFilePath('https://example.com/integral/dog.png', '/integral', MDX)).toBeUndefined()
    expect(mdxFilePath('//example.com/dog.png', '/', MDX)).toBeUndefined()
    expect(mdxFilePath('dog.png', '/', MDX)).toBeUndefined()
  })

  it('maps nothing under a path-only base without an MDX folder', () => {
    expect(mdxFilePath('/integral/dog.png', '/integral', '')).toBeUndefined()
  })

  it('is the reverse of `resolveMdxUrl`', () => {
    for (const base of ['http://localhost:60141', '/integral', '/integral/', '/']) {
      const url = resolveMdxUrl('dog.png', 'advanced/introduction.mdx', base)
      expect(mdxFilePath(url, base, MDX)).toBe(`${MDX}/advanced/dog.png`)
    }
  })
})

describe('socialImageUrl', () => {
  it('returns the image as is with an absolute or no base', () => {
    for (const base of [undefined, '', 'http://localhost:60141']) {
      for (const image of ['', '/a.png', 'a.png', 'http://localhost:60141/a.png']) {
        expect(socialImageUrl(image, base, 'https://docs.pmnd.rs')).toBe(image)
        expect(socialImageUrl(image, base, undefined)).toBe(image)
      }
    }
  })

  it('makes a root-relative image absolute against the site origin, under a path-only base', () => {
    expect(
      socialImageUrl(
        '/integral/advanced/dog.png',
        '/integral',
        'https://abernier.github.io/integral',
      ),
    ).toBe('https://abernier.github.io/integral/advanced/dog.png')
    expect(socialImageUrl('/advanced/dog.png', '/', 'https://example.com')).toBe(
      'https://example.com/advanced/dog.png',
    )
  })

  it('leaves a root-relative image to Next without a site URL', () => {
    expect(socialImageUrl('/integral/dog.png', '/integral', undefined)).toBe('/integral/dog.png')
    expect(socialImageUrl('/integral/dog.png', '/integral', '')).toBe('/integral/dog.png')
  })

  it('leaves any other image as is, under a path-only base', () => {
    for (const image of ['', 'https://example.com/a.png', '//example.com/a.png']) {
      expect(socialImageUrl(image, '/integral', 'https://example.com')).toBe(image)
    }
  })
})
