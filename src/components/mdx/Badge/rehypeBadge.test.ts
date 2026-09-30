import { compileMDX } from 'next-mdx-remote/rsc'
import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'
import { rehypeBadge, tagText } from './rehypeBadge'

describe('tagText', () => {
  it('reads the message of a label-less static badge', () => {
    expect(tagText('https://img.shields.io/badge/-storybook-%23ff69b4')).toBe('storybook')
    expect(tagText('https://img.shields.io/badge/-suspense-brightgreen')).toBe('suspense')
  })

  it('decodes spaces, dashes and underscores the shields.io way', () => {
    expect(tagText('https://img.shields.io/badge/-Dom%20only-red')).toBe('Dom only')
    expect(tagText('https://img.shields.io/badge/-Dom_only-red')).toBe('Dom only')
    expect(tagText('https://img.shields.io/badge/-web--gpu-blue')).toBe('web-gpu')
    expect(tagText('https://img.shields.io/badge/-snake__case-blue')).toBe('snake_case')
  })

  it('ignores the query string', () => {
    expect(tagText('https://img.shields.io/badge/-storybook-ff69b4?style=flat')).toBe('storybook')
  })

  it('leaves any other image alone', () => {
    expect(tagText('https://img.shields.io/npm/v/@react-three/drei')).toBeUndefined()
    expect(tagText('https://img.shields.io/badge/chromatic-171c23.svg')).toBeUndefined()
    expect(tagText('https://img.shields.io/badge/-storybook')).toBeUndefined()
    expect(tagText('/basic-example.gif')).toBeUndefined()
    expect(tagText(undefined)).toBeUndefined()
  })
})

describe('rehypeBadge', () => {
  async function processHtml(html: string) {
    const result = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeBadge())
      .use(rehypeStringify)
      .process(html)
    return String(result).trim()
  }

  it('turns a linked badge image into a linked Badge', async () => {
    const html =
      '<a href="https://drei.pmnd.rs/?path=/story/foo"><img src="https://img.shields.io/badge/-storybook-%23ff69b4" alt=""></a>'
    expect(await processHtml(html)).toBe(
      '<Badge href="https://drei.pmnd.rs/?path=/story/foo">storybook</Badge>',
    )
  })

  it('turns a bare badge image into a Badge', async () => {
    const html = '<img src="https://img.shields.io/badge/-Dom%20only-red" alt="">'
    expect(await processHtml(html)).toBe('<Badge>Dom only</Badge>')
  })

  it('leaves other shields.io images alone', async () => {
    const html =
      '<a href="https://www.npmjs.com/package/@react-three/drei"><img src="https://img.shields.io/npm/v/@react-three/drei"></a>'
    expect(await processHtml(html)).toBe(html)
  })

  it('keeps the link around a badge image that is not its only content', async () => {
    const html =
      '<a href="https://example.com"><img src="https://img.shields.io/badge/-storybook-ff69b4"> story</a>'
    expect(await processHtml(html)).toBe(
      '<a href="https://example.com"><Badge>storybook</Badge> story</a>',
    )
  })
})

describe('rehypeBadge in MDX', () => {
  async function render(source: string) {
    const { content } = await compileMDX({
      source,
      options: { mdxOptions: { rehypePlugins: [rehypeBadge()] } },
      components: {
        Badge: ({ href, children }: { href?: string; children: ReactNode }) =>
          createElement('mark', { 'data-href': href }, children),
      },
    })
    return renderToStaticMarkup(content)
  }

  it('maps the markdown badges of a doc page to the Badge component', async () => {
    const source = [
      '[![](https://img.shields.io/badge/-storybook-%23ff69b4)](https://drei.pmnd.rs/?path=/story/foo)',
      '[![](https://img.shields.io/badge/-suspense-brightgreen)](https://r3f.docs.pmnd.rs/api/hooks#useloader)',
      '![](https://img.shields.io/badge/-Dom%20only-red)',
    ].join('\n')

    expect(await render(source)).toBe(
      '<p><mark data-href="https://drei.pmnd.rs/?path=/story/foo">storybook</mark>\n' +
        '<mark data-href="https://r3f.docs.pmnd.rs/api/hooks#useloader">suspense</mark>\n' +
        '<mark>Dom only</mark></p>',
    )
  })
})
