import { describe, it, expect, beforeAll, afterAll, afterEach, vi, beforeEach } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { libs } from '@/app/page'

// Mock Next.js headers before importing the route
vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: vi.fn((key: string) => {
      if (key === 'host') return 'docs.pmnd.rs'
      return null
    }),
  })),
}))

// Sample test data

const mockLlmsFullTxt = `
<page path="/getting-started" title="Getting Started">
# Getting Started
This is the getting started guide.
</page>
<page path="/api/hooks/use-frame" title="useFrame Hook">
# useFrame Hook
This hook allows you to execute code on every frame.
</page>
<page path="/advanced/performance" title="Performance Tips">
# Performance Tips
Optimize your React Three Fiber applications.
</page>
`

// Every URL the route can reach, derived from `libs` so the mocks cannot drift away
// from the real docs_urls. The previous handlers pointed at r3f.docs.pmnd.rs and
// zustand.docs.pmnd.rs, which the route never requests.
const llmsFullHandlers = Object.values(libs)
  .filter((lib) => 'llms_full' in lib && lib.llms_full)
  .map((lib) => {
    // A local docs_url is served from the current host, mocked as docs.pmnd.rs below
    const origin = lib.docs_url.startsWith('/') ? 'https://docs.pmnd.rs' : lib.docs_url
    return http.get(`${origin}/llms-full.txt`, () => HttpResponse.text(mockLlmsFullTxt))
  })

// Setup MSW server
const server = setupServer(
  ...llmsFullHandlers,

  // Hosts the standalone fetch-and-parse tests below call directly
  http.get('https://r3f.docs.pmnd.rs/llms-full.txt', () => {
    return HttpResponse.text(mockLlmsFullTxt)
  }),

  http.get('https://zustand.docs.pmnd.rs/llms-full.txt', () => {
    return HttpResponse.text(mockLlmsFullTxt)
  }),
)

// 'error', not 'warn': a unit test that quietly reaches the network is not isolated,
// and it was doing exactly that -- the one test importing ./route was dead (see the
// @/package.json alias in vitest.config.ts), so nobody noticed it had no mock
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('MCP Route Handler', () => {
  describe('Mock Endpoints', () => {
    it('should mock llms-full.txt endpoint', async () => {
      const response = await fetch('https://r3f.docs.pmnd.rs/llms-full.txt')
      const text = await response.text()
      expect(text).toContain('<page path="/getting-started"')
      expect(text).toContain('Getting Started')
    })
  })

  describe('URL Resolution Logic', () => {
    it('should resolve external URLs correctly', () => {
      const externalUrl = 'https://r3f.docs.pmnd.rs'
      expect(externalUrl).toMatch(/^https:\/\//)
      expect(externalUrl.startsWith('/')).toBe(false)
    })

    it('should detect local paths', () => {
      const localPath = '/docs'
      expect(localPath.startsWith('/')).toBe(true)
      expect(localPath.startsWith('http')).toBe(false)
    })
  })

  describe('Content Parsing with Cheerio', () => {
    it('should parse page tags from XML', async () => {
      const cheerio = await import('cheerio')
      const $ = cheerio.load(mockLlmsFullTxt, { xmlMode: true })

      const pages = $('page')
      expect(pages.length).toBe(3)

      const firstPage = pages.first()
      expect(firstPage.attr('path')).toBe('/getting-started')
      expect(firstPage.attr('title')).toBe('Getting Started')
    })

    it('should extract text from a specific page', async () => {
      const cheerio = await import('cheerio')
      const $ = cheerio.load(mockLlmsFullTxt, { xmlMode: true })

      const targetPath = '/api/hooks/use-frame'
      const page = $('page').filter((_, el) => $(el).attr('path') === targetPath)

      expect(page.length).toBe(1)
      expect(page.text().trim()).toContain('useFrame Hook')
      expect(page.text().trim()).toContain('execute code on every frame')
    })

    it('should prevent CSS selector injection', async () => {
      const cheerio = await import('cheerio')
      const $ = cheerio.load(mockLlmsFullTxt, { xmlMode: true })

      // Try to inject a CSS selector
      const maliciousPath = '/getting-started[data-test="hack"]'
      const page = $('page').filter((_, el) => $(el).attr('path') === maliciousPath)

      // Should not find anything because we're using exact match with .filter()
      expect(page.length).toBe(0)
    })

    it('should extract paths and titles for index', async () => {
      const cheerio = await import('cheerio')
      const $ = cheerio.load(mockLlmsFullTxt, { xmlMode: true })

      const paths = $('page')
        .map((_, el) => `${$(el).attr('path')} - ${$(el).attr('title') || 'Untitled'}`)
        .get()

      expect(paths).toContain('/getting-started - Getting Started')
      expect(paths).toContain('/api/hooks/use-frame - useFrame Hook')
      expect(paths).toContain('/advanced/performance - Performance Tips')
      expect(paths.length).toBe(3)
    })
  })

  describe('Zod Schema Validation', () => {
    it('should validate library enum', async () => {
      const { z } = await import('zod')

      const validLibs = ['react-three-fiber', 'zustand', 'docs']
      const libSchema = z.enum(validLibs as [string, ...string[]])

      expect(() => libSchema.parse('react-three-fiber')).not.toThrow()
      expect(() => libSchema.parse('zustand')).not.toThrow()
      expect(() => libSchema.parse('docs')).not.toThrow()
      expect(() => libSchema.parse('invalid-lib')).toThrow()
    })

    it('should validate path as string', async () => {
      const { z } = await import('zod')

      const pathSchema = z.string()

      expect(() => pathSchema.parse('/getting-started')).not.toThrow()
      expect(() => pathSchema.parse('/api/hooks/use-frame')).not.toThrow()
      expect(() => pathSchema.parse(123)).toThrow()
      expect(() => pathSchema.parse(null)).toThrow()
    })
  })

  describe('Library Filtering', () => {
    it('should expose exactly the libraries flagged with llms_full', async () => {
      const { libs } = await import('@/app/page')

      const exposed = Object.entries(libs)
        .filter(([, lib]) => 'llms_full' in lib && lib.llms_full)
        .map(([libname]) => libname)

      expect(exposed).toEqual(['react-three-fiber', 'drei', 'zustand', 'docs'])
    })

    it('should exclude pmndrs.github.io libraries that publish no llms-full.txt', async () => {
      const { libs } = await import('@/app/page')

      // Regression: these are hosted on pmndrs.github.io but are not built with this
      // generator, so `${docs_url}/llms-full.txt` 404s. Selecting on the host alone
      // used to expose them with a silently empty index.
      for (const libname of [
        'a11y',
        'react-postprocessing',
        'uikit',
        'xr',
        'prai',
        'viverse',
        'leva',
      ] as const) {
        const lib = libs[libname]
        expect(lib.docs_url).toContain('pmndrs.github.io')
        expect('llms_full' in lib && lib.llms_full).toBeFalsy()
      }
    })

    it('should exclude libraries documented outside pmndrs', async () => {
      const { libs } = await import('@/app/page')

      for (const libname of ['react-spring', 'jotai', 'valtio'] as const) {
        expect('llms_full' in libs[libname] && libs[libname].llms_full).toBeFalsy()
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      server.use(
        http.get('https://error.test.com/llms-full.txt', () => {
          return HttpResponse.error()
        }),
      )

      await expect(fetch('https://error.test.com/llms-full.txt')).rejects.toThrow()
    })

    it('should handle 404 responses', async () => {
      server.use(
        http.get('https://notfound.test.com/llms-full.txt', () => {
          return new HttpResponse(null, { status: 404 })
        }),
      )

      const response = await fetch('https://notfound.test.com/llms-full.txt')
      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
    })

    it('should handle invalid XML gracefully', async () => {
      const cheerio = await import('cheerio')
      const invalidXml = '<page>incomplete tag'

      // Cheerio is lenient and will parse even invalid XML
      const $ = cheerio.load(invalidXml, { xmlMode: true })
      expect($('page').length).toBeGreaterThanOrEqual(0)
    })

    it('should handle empty XML', async () => {
      const cheerio = await import('cheerio')
      const emptyXml = ''

      const $ = cheerio.load(emptyXml, { xmlMode: true })
      expect($('page').length).toBe(0)
    })

    it('should handle pages without titles', async () => {
      const cheerio = await import('cheerio')
      const xmlWithoutTitles = '<page path="/test">Content</page>'

      const $ = cheerio.load(xmlWithoutTitles, { xmlMode: true })
      const paths = $('page')
        .map((_, el) => `${$(el).attr('path')} - ${$(el).attr('title') || 'Untitled'}`)
        .get()

      expect(paths[0]).toBe('/test - Untitled')
    })
  })

  describe('Special Characters Handling', () => {
    it('should handle pages with special characters in content', async () => {
      const cheerio = await import('cheerio')
      const specialCharContent = `
<page path="/special" title="Special & Chars">
Content with &lt;special&gt; characters &amp; symbols.
</page>
`
      const $ = cheerio.load(specialCharContent, { xmlMode: true })
      const page = $('page').first()

      expect(page.text()).toBeDefined()
      expect(page.attr('title')).toContain('&')
    })

    it('should handle paths with hyphens and slashes', async () => {
      const cheerio = await import('cheerio')
      const complexPaths = `
<page path="/api/hooks/use-frame" title="useFrame">Content 1</page>
<page path="/getting-started/installation" title="Install">Content 2</page>
`
      const $ = cheerio.load(complexPaths, { xmlMode: true })

      const paths = $('page')
        .map((_, el) => $(el).attr('path'))
        .get()

      expect(paths).toContain('/api/hooks/use-frame')
      expect(paths).toContain('/getting-started/installation')
    })
  })

  describe('Integration Tests', () => {
    it('should fetch and parse llms-full.txt', async () => {
      const cheerio = await import('cheerio')

      const response = await fetch('https://r3f.docs.pmnd.rs/llms-full.txt')
      const content = await response.text()
      const $ = cheerio.load(content, { xmlMode: true })

      const pages = $('page')
      expect(pages.length).toBe(3)

      const paths = pages.map((_, el) => $(el).attr('path')).get()
      expect(paths).toContain('/getting-started')
      expect(paths).toContain('/api/hooks/use-frame')
      expect(paths).toContain('/advanced/performance')
    })

    it('should handle local library path resolution', async () => {
      const localPath = '/docs'
      const baseUrl = 'https://docs.pmnd.rs'

      const fullUrl = localPath.startsWith('/') ? baseUrl : localPath

      expect(fullUrl).toBe(baseUrl)
    })

    it('should error, not return an empty index, when llms-full.txt is missing', async () => {
      // Regression: the index resource used to skip the response.ok check, so a 404
      // parsed as zero <page> elements and shipped an empty index. A client reads that
      // as "this library has no pages" and starts guessing paths.
      server.use(
        http.get('https://pmndrs.github.io/react-three-fiber/llms-full.txt', () => {
          return new HttpResponse('Not Found', { status: 404 })
        }),
      )

      const { POST } = await import('./route')
      const response = await POST(
        new Request('https://docs.pmnd.rs/api/mcp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'resources/read',
            params: { uri: 'docs://react-three-fiber/index' },
          }),
        }),
      )

      const body = await response.text()
      expect(body).toContain('Failed to fetch')
      expect(body).not.toContain('"text":""')
    })
  })

  describe('get_page_content Tool', () => {
    it('should retrieve page content successfully', async () => {
      const { POST } = await import('./route')
      const mockRequest = new Request('https://docs.pmnd.rs/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'get_page_content',
            arguments: {
              lib: 'react-three-fiber',
              path: '/api/hooks/use-frame',
            },
          },
        }),
      })

      const response = await POST(mockRequest)
      const body = await response.text()

      // Assert on the content, not merely that something came back: this test used to
      // check toBeDefined(), which an error response satisfies just as well -- so it
      // passed while the module failed to import, and would pass again unmocked
      expect(body).toContain('This hook allows you to execute code on every frame')
      expect(body).not.toContain('MCP server error')
    })

    it('should return error when page not found', async () => {
      const cheerio = await import('cheerio')
      const $ = cheerio.load(mockLlmsFullTxt, { xmlMode: true })

      const nonExistentPath = '/non-existent-page'
      const page = $('page').filter((_, el) => $(el).attr('path') === nonExistentPath)

      expect(page.length).toBe(0)
    })

    it('should extract correct content for valid page', async () => {
      const cheerio = await import('cheerio')
      const $ = cheerio.load(mockLlmsFullTxt, { xmlMode: true })

      const targetPath = '/api/hooks/use-frame'
      const page = $('page').filter((_, el) => $(el).attr('path') === targetPath)

      expect(page.length).toBe(1)
      const content = page.text().trim()
      expect(content).toContain('useFrame Hook')
      expect(content).toContain('execute code on every frame')
    })

    it('should handle multiple libraries correctly', async () => {
      const libs = {
        'react-three-fiber': { docs_url: 'https://r3f.docs.pmnd.rs' },
        zustand: { docs_url: 'https://zustand.docs.pmnd.rs' },
      }

      const libNames = Object.keys(libs)
      expect(libNames).toContain('react-three-fiber')
      expect(libNames).toContain('zustand')
    })

    it('should validate lib parameter is enum', async () => {
      const { z } = await import('zod')
      const validLibs = ['react-three-fiber', 'zustand']
      const libSchema = z.enum(validLibs as [string, ...string[]])

      expect(() => libSchema.parse('react-three-fiber')).not.toThrow()
      expect(() => libSchema.parse('invalid-library')).toThrow()
    })

    it('should validate path parameter is string', async () => {
      const { z } = await import('zod')
      const pathSchema = z.string()

      expect(() => pathSchema.parse('/api/hooks/use-frame')).not.toThrow()
      expect(() => pathSchema.parse(123)).toThrow()
    })

    it('should format tool response correctly', async () => {
      const cheerio = await import('cheerio')
      const $ = cheerio.load(mockLlmsFullTxt, { xmlMode: true })

      const page = $('page').filter((_, el) => $(el).attr('path') === '/getting-started')
      const content = page.text().trim()

      const expectedResponse = {
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      }

      expect(expectedResponse.content).toHaveLength(1)
      expect(expectedResponse.content[0].type).toBe('text')
      expect(expectedResponse.content[0].text).toContain('Getting Started')
    })

    it('should handle fetch errors in tool execution', async () => {
      server.use(
        http.get('https://error.docs.pmnd.rs/llms-full.txt', () => {
          return HttpResponse.error()
        }),
      )

      await expect(fetch('https://error.docs.pmnd.rs/llms-full.txt')).rejects.toThrow()
    })

    it('should handle 404 errors in tool execution', async () => {
      server.use(
        http.get('https://notfound.docs.pmnd.rs/llms-full.txt', () => {
          return new HttpResponse(null, { status: 404, statusText: 'Not Found' })
        }),
      )

      const response = await fetch('https://notfound.docs.pmnd.rs/llms-full.txt')
      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
    })

    it('should prevent CSS selector injection in tool', async () => {
      const cheerio = await import('cheerio')
      const $ = cheerio.load(mockLlmsFullTxt, { xmlMode: true })

      const maliciousPath = '/getting-started[data-test="hack"]'
      const page = $('page').filter((_, el) => $(el).attr('path') === maliciousPath)

      expect(page.length).toBe(0)
    })
  })
})
