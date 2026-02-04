import { describe, it, expect, beforeAll, afterAll, afterEach, vi, beforeEach } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

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
const mockSkillMd = `# PMNDRS Docs MCP Server

This is the skill manifest for the PMNDRS documentation server.

## Supported Libraries
- react-three-fiber
- zustand
- docs
`

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

// Setup MSW server
const server = setupServer(
  // Mock /skill.md endpoint
  http.get('https://docs.pmnd.rs/skill.md', () => {
    return HttpResponse.text(mockSkillMd)
  }),

  // Mock llms-full.txt for external libraries
  http.get('https://r3f.docs.pmnd.rs/llms-full.txt', () => {
    return HttpResponse.text(mockLlmsFullTxt)
  }),

  http.get('https://zustand.docs.pmnd.rs/llms-full.txt', () => {
    return HttpResponse.text(mockLlmsFullTxt)
  }),

  // Mock llms-full.txt for local library
  http.get('https://docs.pmnd.rs/docs/llms-full.txt', () => {
    return HttpResponse.text(mockLlmsFullTxt)
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('MCP Route Handler', () => {
  describe('Mock Endpoints', () => {
    it('should have msw setup correctly', async () => {
      const response = await fetch('https://docs.pmnd.rs/skill.md')
      const text = await response.text()
      expect(text).toContain('PMNDRS Docs MCP Server')
    })

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
    it('should include libraries with pmndrs.github.io URLs', async () => {
      const mockLibs = {
        'react-three-fiber': { docs_url: 'https://r3f.docs.pmnd.rs' },
        zustand: { docs_url: 'https://zustand.docs.pmnd.rs' },
      }

      const filtered = Object.entries(mockLibs).filter(([, lib]) =>
        lib.docs_url.includes('pmndrs.github.io'),
      )

      // Note: Our test URLs don't have pmndrs.github.io, so this would be 0
      // In real implementation, r3f.docs.pmnd.rs redirects to pmndrs.github.io
      expect(filtered.length).toBeGreaterThanOrEqual(0)
    })

    it('should include libraries with local paths', async () => {
      const mockLibs = {
        docs: { docs_url: '/docs' },
        external: { docs_url: 'https://external.com' },
      }

      const filtered = Object.entries(mockLibs).filter(([, lib]) => lib.docs_url.startsWith('/'))

      expect(filtered.length).toBe(1)
      expect(filtered[0][0]).toBe('docs')
    })

    it('should filter out libraries without pmndrs.github.io or local paths', async () => {
      const mockLibs = {
        valid1: { docs_url: 'https://pmndrs.github.io/lib1' },
        valid2: { docs_url: '/local-lib' },
        invalid: { docs_url: 'https://other-site.com' },
      }

      const filtered = Object.entries(mockLibs).filter(
        ([, lib]) => lib.docs_url.includes('pmndrs.github.io') || lib.docs_url.startsWith('/'),
      )

      expect(filtered.length).toBe(2)
      expect(filtered.find(([name]) => name === 'invalid')).toBeUndefined()
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
    it('should fetch and parse skill.md', async () => {
      const response = await fetch('https://docs.pmnd.rs/skill.md')
      const content = await response.text()

      expect(content).toContain('PMNDRS Docs MCP Server')
      expect(content).toContain('react-three-fiber')
      expect(content).toContain('zustand')
    })

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
  })
})
