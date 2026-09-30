import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('keeps the secondary look with no color', () => {
    const html = renderToStaticMarkup(<Badge>Dom only</Badge>)
    expect(html).toContain('bg-secondary')
    expect(html).not.toContain('style=')
  })

  it('points the secondary colors at the main pair of a color role', () => {
    const html = renderToStaticMarkup(<Badge color="tip">suspense</Badge>)
    expect(html).toContain('--secondary:var(--md-sys-color-tip, ')
    expect(html).toContain('--secondary-foreground:var(--md-sys-color-on-tip, ')
  })

  it('falls back to the secondary look for a role the theme does not have', () => {
    const html = renderToStaticMarkup(<Badge color="brand-new">new</Badge>)
    expect(html).toContain(
      'style="--secondary:var(--md-sys-color-brand-new, var(--md-sys-color-secondary-container));--secondary-foreground:var(--md-sys-color-on-brand-new, var(--md-sys-color-on-secondary-container))"',
    )
  })

  it('links to href, in a new tab when external', () => {
    const html = renderToStaticMarkup(<Badge href="https://drei.pmnd.rs/">storybook</Badge>)
    expect(html).toMatch(/^<a [^>]*href="https:\/\/drei.pmnd.rs\/"[^>]*target="_blank"/)
  })

  it('links to an internal page without its .mdx extension, as `a` does', () => {
    const html = renderToStaticMarkup(<Badge href="/authoring/badge.mdx">badge</Badge>)
    expect(html).toMatch(/^<a [^>]*href="\/authoring\/badge"/)
    expect(html).not.toContain('target=')
  })

  it('shows a known logo at the start, and a de-emphasized label', () => {
    const html = renderToStaticMarkup(
      <Badge label="GitHub" logo="github">
        Open in Codespaces
      </Badge>,
    )
    expect(html).toMatch(/<svg data-icon="inline-start"[^>]*><path d="M12 \.297/)
    expect(html).toContain('<span class="opacity-70">GitHub</span>Open in Codespaces')
  })

  it('shows no logo for an unknown slug', () => {
    const html = renderToStaticMarkup(<Badge logo="nope">a</Badge>)
    expect(html).not.toContain('<svg')
  })
})
