import { compileMDX } from 'next-mdx-remote/rsc'
import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { rehypeInlineFlow } from './rehypeInlineFlow'

async function render(source: string) {
  const { content } = await compileMDX({
    source,
    options: {
      mdxOptions: { rehypePlugins: [rehypeInlineFlow(['Badge'], { except: ['Group'] })] },
    },
    components: {
      Group: ({ children }: { children: ReactNode }) => createElement('section', {}, children),
      Badge: ({
        href,
        color,
        label,
        logo,
        children,
      }: {
        href?: string
        color?: string
        label?: string
        logo?: string
        children: ReactNode
      }) =>
        createElement(
          'mark',
          { 'data-href': href, 'data-color': color, 'data-label': label, 'data-logo': logo },
          children,
        ),
    },
  })
  return renderToStaticMarkup(content)
}

describe('rehypeInlineFlow', () => {
  it('puts badges written on the same line in one paragraph', async () => {
    expect(await render('<Badge>a</Badge> <Badge>b</Badge>')).toBe(
      '<p><mark>a</mark> <mark>b</mark></p>',
    )
  })

  it('puts badges written on consecutive lines in one paragraph', async () => {
    expect(await render('<Badge>a</Badge>\n<Badge>b</Badge>\n<Badge>c</Badge>')).toBe(
      '<p><mark>a</mark> <mark>b</mark> <mark>c</mark></p>',
    )
  })

  it('leaves badges in running text where they are', async () => {
    expect(await render('Works with <Badge>a</Badge> and <Badge>b</Badge>.')).toBe(
      '<p>Works with <mark>a</mark> and <mark>b</mark>.</p>',
    )
  })

  it('ends the paragraph at the first block', async () => {
    expect(await render('<Badge>a</Badge>\n<Badge>b</Badge>\n\n## Title\n\n<Badge>c</Badge>')).toBe(
      '<p><mark>a</mark> <mark>b</mark></p>\n<h2>Title</h2>\n<p><mark>c</mark></p>',
    )
  })

  it('does so inside other components too', async () => {
    expect(await render('<div>\n<Badge>a</Badge>\n<Badge>b</Badge>\n</div>')).toBe(
      '<div><p><mark>a</mark> <mark>b</mark></p></div>',
    )
  })

  it('leaves them as they are inside an excepted component', async () => {
    expect(await render('<Group>\n<Badge>a</Badge>\n<Badge>b</Badge>\n</Group>')).toBe(
      '<section><mark>a</mark><mark>b</mark></section>',
    )
  })

  it('keeps the text only of a badge written over several lines', async () => {
    expect(await render('<Badge color="tip">\n  a\n</Badge>\n<Badge>b</Badge>')).toBe(
      '<p><mark data-color="tip">a</mark> <mark>b</mark></p>',
    )
  })

  it('leaves images alone, shields.io ones included', async () => {
    expect(
      await render('[![](https://img.shields.io/badge/-storybook-ff69b4)](https://drei.pmnd.rs/)'),
    ).toContain(
      // after the `<link rel="preload">` React hoists for the image
      '<p><a href="https://drei.pmnd.rs/"><img src="https://img.shields.io/badge/-storybook-ff69b4" alt=""/></a></p>',
    )
  })
})
