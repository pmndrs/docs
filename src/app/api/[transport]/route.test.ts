import { describe, it, expect, beforeAll, afterAll, afterEach, vi, beforeEach } from 'vitest'
import { setupServer } from 'msw/node'
import { delay, http, HttpResponse } from 'msw'
import { libs } from '@/libs'

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

// The examples catalog, as pmndrs/examples publishes it: markdown, already
// rendered, one document per example plus the index. This server passes them on
// untouched, so the fixtures are text and the assertions are about routing --
// the rendering itself is tested where it is produced.
const mockExampleIndex = `aquarium · #transmission
arkanoid · Simple arkanoid implementation using cannon physics. · +cannon · #physics,game · ~23k
`

const mockExample = `# Caustics

Demo: https://pmndrs.github.io/examples/examples/caustics
Dependencies: @react-three/drei@10.7.8

## src/App.tsx

\`\`\`tsx
const caustics = true
\`\`\`
`

// Setup MSW server
const server = setupServer(
  ...llmsFullHandlers,

  http.get('https://pmndrs.github.io/examples/llms.txt', () => HttpResponse.text(mockExampleIndex)),

  http.get('https://pmndrs.github.io/examples/examples/caustics.md', () =>
    HttpResponse.text(mockExample),
  ),

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
      const { libs } = await import('@/libs')

      const exposed = Object.entries(libs)
        .filter(([, lib]) => 'llms_full' in lib && lib.llms_full)
        .map(([libname]) => libname)

      expect(exposed).toEqual([
        'react-three-fiber',
        'drei',
        'zustand',
        'a11y',
        'react-postprocessing',
        'docs',
        'react-three-jolt',
        'sky',
        'denoiser',
      ])
    })

    it('should exclude pmndrs.github.io libraries that publish no llms-full.txt', async () => {
      const { libs } = await import('@/libs')

      // Regression: these are hosted on pmndrs.github.io but are not flagged as shipping
      // `${docs_url}/llms-full.txt` (missing, or not vetted yet). Selecting on the host alone
      // used to expose them with a silently empty index.
      for (const libname of ['uikit', 'xr', 'prai', 'viverse', 'leva'] as const) {
        const lib = libs[libname]
        expect(lib.docs_url).toContain('pmndrs.github.io')
        expect('llms_full' in lib && lib.llms_full).toBeFalsy()
      }
    })

    it('should exclude libraries documented outside pmndrs', async () => {
      const { libs } = await import('@/libs')

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

  describe('Examples', () => {
    async function call(method: string, params: unknown) {
      const { POST } = await import('./route')
      const response = await POST(
        new Request('https://docs.pmnd.rs/api/mcp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
          },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        }),
      )
      return response.text()
    }

    it('serves the whole gallery as one line per example', async () => {
      const body = await call('resources/read', { uri: 'examples://index' })

      expect(body).toContain('aquarium · #transmission')
      expect(body).toContain(
        'arkanoid · Simple arkanoid implementation using cannon physics. · +cannon · #physics,game · ~23k',
      )
      expect(body).not.toContain('MCP server error')
    })

    it('passes one example through as published', async () => {
      const body = await call('tools/call', {
        name: 'get_example',
        arguments: { name: 'caustics' },
      })

      expect(body).toContain('# Caustics')
      expect(body).toContain('const caustics = true')
      expect(body).toContain('Dependencies: @react-three/drei@10.7.8')
      expect(body).not.toContain('MCP server error')
    })

    it.each(['../../../etc/passwd', 'Caustics'])(
      'refuses %j without reaching for a URL',
      async (name) => {
        // No msw handler exists for whatever this would resolve to, and the server
        // runs with onUnhandledRequest: 'error' -- so a fetch here fails the test on
        // its own, and the assertion below is about the message a client gets.
        const body = await call('tools/call', { name: 'get_example', arguments: { name } })

        expect(body).toContain('Not an example name')
      },
    )

    it('errors, rather than serving an empty gallery, when the catalog is missing', async () => {
      server.use(
        http.get('https://pmndrs.github.io/examples/llms.txt', () => {
          return new HttpResponse('Not Found', { status: 404 })
        }),
      )

      const body = await call('resources/read', { uri: 'examples://index' })

      expect(body).toContain('Failed to fetch')
      expect(body).not.toContain('"text":""')
    })
    it('fails with a tool error, rather than hanging, when the catalog does not answer', async () => {
      // The upstream timeout, cut short so the test does not wait the real one out
      const timeout = AbortSignal.timeout.bind(AbortSignal)
      const shortened = vi.spyOn(AbortSignal, 'timeout').mockImplementation(() => timeout(20))
      server.use(
        http.get('https://pmndrs.github.io/examples/examples/caustics.md', async () => {
          await delay('infinite')
          return HttpResponse.text(mockExample)
        }),
      )

      try {
        const body = await call('tools/call', {
          name: 'get_example',
          arguments: { name: 'caustics' },
        })

        expect(body).toContain('"isError":true')
        expect(body).toContain(
          'Timed out after 10s fetching https://pmndrs.github.io/examples/examples/caustics.md',
        )
      } finally {
        shortened.mockRestore()
      }
    })
  })

  describe('CORS', () => {
    const corsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers':
        'Content-Type, Accept, Authorization, Mcp-Session-Id, MCP-Protocol-Version, Last-Event-ID',
      'access-control-expose-headers': 'Mcp-Session-Id, MCP-Protocol-Version',
      'access-control-max-age': '86400',
    }

    it('answers a preflight with 204 and the CORS headers', async () => {
      // Regression: without an OPTIONS export, Next answered the preflight itself, with no
      // Access-Control headers, and a browser-based client was refused without a word.
      const { OPTIONS } = await import('./route')
      const response = OPTIONS()

      expect(response.status).toBe(204)
      for (const [name, value] of Object.entries(corsHeaders)) {
        expect(response.headers.get(name)).toBe(value)
      }
    })

    it('carries Access-Control-Allow-Origin on a successful POST', async () => {
      const { POST } = await import('./route')
      const response = await POST(
        new Request('https://docs.pmnd.rs/api/mcp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
          },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
        }),
      )

      expect(response.status).toBe(200)
      expect(response.headers.get('access-control-allow-origin')).toBe('*')
    })
  })

  describe('Refused requests', () => {
    let warn: ReturnType<typeof vi.spyOn>
    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })
    afterEach(() => {
      warn.mockRestore()
    })

    it('answers a malformed JSON body with a 400 parse error, at once', async () => {
      // Regression: mcp-handler parsed the body itself and, on a broken one, threw where
      // nothing caught it -- the response was never written, and in production the function
      // ran until Vercel timed it out. Here this test would hit its timeout.
      const { POST } = await import('./route')
      const started = Date.now()
      const response = await POST(
        new Request('https://docs.pmnd.rs/api/mcp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
          },
          body: '{"jsonrpc":',
        }),
      )

      expect(Date.now() - started).toBeLessThan(1000)
      expect(response.status).toBe(400)
      expect(response.headers.get('access-control-allow-origin')).toBe('*')
      expect(await response.json()).toEqual({
        jsonrpc: '2.0',
        error: { code: -32700, message: 'Parse error' },
        id: null,
      })
    })

    it('answers an empty body with the same 400', async () => {
      const { POST } = await import('./route')
      const response = await POST(
        new Request('https://docs.pmnd.rs/api/mcp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
          },
        }),
      )

      expect(response.status).toBe(400)
      expect(await response.json()).toMatchObject({ error: { code: -32700 } })
    })

    it('logs one warn line, with the reason, when the handler refuses a request', async () => {
      // Valid JSON, but not a JSON-RPC message: the SDK answers 400, and that answer is what
      // the line is for -- it is the only trace of why a client is being refused.
      const { POST } = await import('./route')
      const response = await POST(
        new Request('https://docs.pmnd.rs/api/mcp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
            'User-Agent': 'diag-400/0.1',
            'MCP-Protocol-Version': '2025-11-25',
          },
          body: JSON.stringify({ hello: 'world' }),
        }),
      )

      expect(response.status).toBe(400)
      expect(warn).toHaveBeenCalledTimes(1)
      const [label, line] = warn.mock.calls[0]
      expect(label).toBe('MCP request refused')
      expect(JSON.parse(line as string)).toMatchObject({
        status: 400,
        methods: [null],
        userAgent: 'diag-400/0.1',
        protocolVersion: '2025-11-25',
        response: expect.stringContaining('-32700'),
      })
      // The client still gets the body the handler wrote: logging read a clone
      expect(await response.text()).toContain('-32700')
    })

    it('logs nothing for a request the handler accepts', async () => {
      const { POST } = await import('./route')
      const response = await POST(
        new Request('https://docs.pmnd.rs/api/mcp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
          },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
        }),
      )

      expect(response.status).toBe(200)
      expect(warn).not.toHaveBeenCalled()
    })
  })

  describe('SSE transport', () => {
    it('answers /api/sse with a 404 instead of hanging', async () => {
      // Regression: with SSE enabled, mcp-handler reaches for Redis on this endpoint,
      // throws for want of a URL, and never ends the response -- in production the
      // function ran until Vercel killed it. Here this test would hit its timeout.
      const { GET } = await import('./route')
      const response = await GET(
        new Request('https://docs.pmnd.rs/api/sse', {
          headers: { Accept: 'text/event-stream' },
        }),
      )

      expect(response.status).toBe(404)
    })
  })
})
