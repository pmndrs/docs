import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CodeFileIcon, fileIconName } from './CodeFileIcon'

describe('fileIconName', () => {
  it.each([
    ['lib/utils.ts', 'typescript'],
    ['src/app/page.tsx', 'react'],
    ['Button.jsx', 'react'],
    ['eslint.config.mjs', 'javascript'],
    ['src/styles/globals.css', 'css'],
    ['package.json', 'json'],
    ['index.html', 'html5'],
    ['README.md', 'markdown'],
    ['docs/intro.mdx', 'mdx'],
    ['.github/workflows/docs.yml', 'yaml'],
    ['scripts/build.sh', 'terminal'],
    ['UTILS.TS', 'typescript'],
  ])('picks %s by its extension: %s', (filename, name) => {
    expect(fileIconName(filename, undefined)).toBe(name)
  })

  it('prefers the extension to the language', () => {
    expect(fileIconName('tsconfig.json', 'ts')).toBe('json')
  })

  it('falls back to the language for an unknown extension or none', () => {
    expect(fileIconName('Dockerfile', 'bash')).toBe('terminal')
    expect(fileIconName('vite.config.foo', 'ts')).toBe('typescript')
  })

  it('reads the language in any case', () => {
    expect(fileIconName('Dockerfile', 'Bash')).toBe('terminal')
    expect(fileIconName(undefined, 'TSX')).toBe('react')
  })

  it('knows neither an unknown extension nor an unknown language', () => {
    expect(fileIconName('main.rs', 'rust')).toBeUndefined()
    expect(fileIconName('file.constructor', undefined)).toBeUndefined()
  })
})

describe('CodeFileIcon', () => {
  it('draws the brand logo of a known type', () => {
    const html = renderToStaticMarkup(<CodeFileIcon filename="lib/utils.ts" />)
    expect(html).toMatch(/^<svg[^>]*viewBox="0 0 24 24"[^>]*fill="currentColor"/)
  })

  it('draws a terminal for a shell script', () => {
    const html = renderToStaticMarkup(<CodeFileIcon filename="setup.sh" />)
    expect(html).toContain('lucide-square-terminal')
  })

  it('draws a generic code file otherwise', () => {
    const html = renderToStaticMarkup(<CodeFileIcon filename="main.rs" language="rust" />)
    expect(html).toContain('lucide-file-code')
  })
})
