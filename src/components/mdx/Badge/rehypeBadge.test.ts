import { compileMDX } from 'next-mdx-remote/rsc'
import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'
import { rehypeBadge } from './rehypeBadge'

async function processHtml(html: string) {
  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeBadge())
    .use(rehypeStringify)
    .process(html)
  return String(result).trim()
}

/** The HTML as it comes out of the same pipeline, untouched: what "the image stays" means */
async function unchanged(html: string) {
  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeStringify)
    .process(html)
  return String(result).trim()
}

function link(href: string, src: string) {
  return `<a href="${href}"><img src="${src}" alt=""></a>`
}

describe('rehypeBadge: tags', () => {
  it('turns a linked badge image into a linked Badge', async () => {
    const html = link(
      'https://drei.pmnd.rs/?path=/story/foo',
      'https://img.shields.io/badge/-storybook-%23ff69b4',
    )
    expect(await processHtml(html)).toBe(
      '<Badge href="https://drei.pmnd.rs/?path=/story/foo" color="storybook" logo="storybook">storybook</Badge>',
    )
  })

  it('turns a bare badge image into a Badge', async () => {
    const html = '<img src="https://img.shields.io/badge/-Dom%20only-red" alt="">'
    expect(await processHtml(html)).toBe('<Badge color="caution">Dom only</Badge>')
  })

  it('reads a no-break space in the URL as a space', async () => {
    const html = '<img src="https://img.shields.io/badge/-Dom only-red" alt="">'
    expect(await processHtml(html)).toBe('<Badge color="caution">Dom only</Badge>')
  })

  it('keeps the link around a badge image that is not its only content', async () => {
    const html =
      '<a href="https://example.com"><img src="https://img.shields.io/badge/-storybook-ff69b4"> story</a>'
    expect(await processHtml(html)).toBe(
      '<a href="https://example.com"><Badge color="storybook" logo="storybook">storybook</Badge> story</a>',
    )
  })

  it('turns a three-part badge into a Badge with its label, color and logo', async () => {
    // As in koota's README
    const html = link(
      'https://github.com/pmndrs/koota',
      'https://img.shields.io/badge/github-repo-blue?logo=github',
    )
    expect(await processHtml(html)).toBe(
      '<Badge href="https://github.com/pmndrs/koota" color="note" label="github" logo="github">repo</Badge>',
    )
  })
})

//
// The badge row of drei's getting-started/introduction.mdx, one fixture per shape
//

const DREI = {
  storybook: link(
    'https://drei.pmnd.rs/',
    'https://img.shields.io/static/v1?message=Storybook&amp;style=flat&amp;colorA=000000&amp;colorB=000000&amp;label=&amp;logo=storybook&amp;logoColor=ffffff',
  ),
  chromatic: link(
    'https://www.chromatic.com/library?appId=64a019f36ecd3751d0ada612&amp;branch=master',
    'https://img.shields.io/badge/chromatic-171c23.svg?style=flat&amp;colorA=000000&amp;colorB=000000&amp;logo=chromatic&amp;logoColor=ffffff',
  ),
  version: link(
    'https://www.npmjs.com/package/@react-three/drei',
    'https://img.shields.io/npm/v/@react-three/drei?style=flat&amp;colorA=000000&amp;colorB=000000',
  ),
  downloads: link(
    'https://www.npmjs.com/package/@react-three/drei',
    'https://img.shields.io/npm/dt/@react-three/drei.svg?style=flat&amp;colorA=000000&amp;colorB=000000',
  ),
  discord: link(
    'https://discord.com/channels/740090768164651008/741751532592038022',
    'https://img.shields.io/discord/740090768164651008?style=flat&amp;colorA=000000&amp;colorB=000000&amp;label=discord&amp;logo=discord&amp;logoColor=ffffff',
  ),
  codespaces: link(
    'https://github.com/codespaces/new?template_repository=pmndrs%2Fdrei',
    'https://img.shields.io/static/v1?&amp;message=Open%20in%20%20Codespaces&amp;style=flat&amp;colorA=000000&amp;colorB=000000&amp;label=GitHub&amp;logo=github&amp;logoColor=ffffff',
  ),
}

const DREI_BADGES = {
  storybook:
    '<Badge href="https://drei.pmnd.rs/" color="storybook" logo="storybook">Storybook</Badge>',
  chromatic:
    '<Badge href="https://www.chromatic.com/library?appId=64a019f36ecd3751d0ada612&#x26;branch=master" logo="chromatic">chromatic</Badge>',
  version: '<Badge href="https://www.npmjs.com/package/@react-three/drei" logo="npm">npm</Badge>',
  downloads: '<Badge href="https://www.npmjs.com/package/@react-three/drei">downloads</Badge>',
  discord:
    '<Badge href="https://discord.com/channels/740090768164651008/741751532592038022" logo="discord">discord</Badge>',
  codespaces:
    '<Badge href="https://github.com/codespaces/new?template_repository=pmndrs%2Fdrei" label="GitHub" logo="github">Open in Codespaces</Badge>',
}

describe('rehypeBadge: the drei introduction row', () => {
  for (const shape of Object.keys(DREI) as (keyof typeof DREI)[]) {
    it(`turns the ${shape} badge into a Badge`, async () => {
      expect(await processHtml(DREI[shape])).toBe(DREI_BADGES[shape])
    })
  }

  it('turns the whole row into Badges, and never fetches anything', async () => {
    const html = `<p>${Object.values(DREI).join('\n')}</p>`
    expect(await processHtml(html)).toBe(`<p>${Object.values(DREI_BADGES).join('\n')}</p>`)
  })

  it('shows no label for a discord badge with an empty one, as koota does', async () => {
    const html = link(
      'https://discord.gg/poimandres',
      'https://img.shields.io/discord/740090768164651008?label=&amp;logo=discord',
    )
    expect(await processHtml(html)).toBe(
      '<Badge href="https://discord.gg/poimandres" logo="discord">discord</Badge>',
    )
  })
})

describe('rehypeBadge: all or nothing, per container', () => {
  const malformed = link('https://example.com', 'https://img.shields.io/badge/-no-color-at-all')

  it('converts a paragraph whose shields.io images are all badges', async () => {
    const html = `<p>${DREI.storybook}\n${DREI.version}</p>`
    expect(await processHtml(html)).toBe(`<p>${DREI_BADGES.storybook}\n${DREI_BADGES.version}</p>`)
  })

  it('leaves every shields.io image of a paragraph when one is not a badge', async () => {
    const html = `<p>${DREI.storybook}\n${malformed}\n<img src="https://img.shields.io/badge/-Dom%20only-red"></p>`
    expect(await processHtml(html)).toBe(await unchanged(html))
  })

  it('decides per container: another paragraph still converts', async () => {
    const html = `<p>${DREI.storybook} ${malformed}</p><p>${DREI.chromatic}</p>`
    expect(await processHtml(html)).toBe(
      (await unchanged(`<p>${DREI.storybook} ${malformed}</p>`)) +
        `<p>${DREI_BADGES.chromatic}</p>`,
    )
  })

  it('ignores images that are not shields.io ones', async () => {
    const html = `<p>${DREI.storybook} <img src="/basic-example.gif"></p>`
    expect(await processHtml(html)).toBe(
      `<p>${DREI_BADGES.storybook} <img src="/basic-example.gif"></p>`,
    )
  })
})

//
// MDX
//

async function render(source: string) {
  const { content } = await compileMDX({
    source,
    options: { mdxOptions: { rehypePlugins: [rehypeBadge()] } },
    components: {
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

describe('rehypeBadge in MDX', () => {
  it('maps the markdown badges of a doc page to the Badge component', async () => {
    const source = [
      '[![](https://img.shields.io/badge/-storybook-%23ff69b4)](https://drei.pmnd.rs/?path=/story/foo)',
      '[![](https://img.shields.io/badge/-suspense-brightgreen)](https://r3f.docs.pmnd.rs/api/hooks#useloader)',
      '![](https://img.shields.io/badge/-Dom%20only-red)',
    ].join('\n')

    expect(await render(source)).toBe(
      '<p><mark data-href="https://drei.pmnd.rs/?path=/story/foo" data-color="storybook" data-logo="storybook">storybook</mark>\n' +
        '<mark data-href="https://r3f.docs.pmnd.rs/api/hooks#useloader" data-color="tip">suspense</mark>\n' +
        '<mark data-color="caution">Dom only</mark></p>',
    )
  })

  it('reads the raw no-break space of drei pages', async () => {
    // As written in e.g. drei's docs/misc/html.mdx: markdown accepts a U+00A0 in a URL
    expect(await render('![](https://img.shields.io/badge/-Dom only-red)')).toBe(
      '<p><mark data-color="caution">Dom only</mark></p>',
    )
  })

  it('maps the drei badge row, label and logo included', async () => {
    const source = [
      '[![Storybook](https://img.shields.io/static/v1?message=Storybook&style=flat&colorA=000000&colorB=000000&label=&logo=storybook&logoColor=ffffff)](https://drei.pmnd.rs/)',
      '[![Version](https://img.shields.io/npm/v/@react-three/drei?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@react-three/drei)',
      '[![Open in GitHub Codespaces](https://img.shields.io/static/v1?&message=Open%20in%20%20Codespaces&style=flat&colorA=000000&colorB=000000&label=GitHub&logo=github&logoColor=ffffff)](https://github.com/codespaces/new?template_repository=pmndrs%2Fdrei)',
    ].join('\n')

    expect(await render(source)).toBe(
      '<p><mark data-href="https://drei.pmnd.rs/" data-color="storybook" data-logo="storybook">Storybook</mark>\n' +
        '<mark data-href="https://www.npmjs.com/package/@react-three/drei" data-logo="npm">npm</mark>\n' +
        '<mark data-href="https://github.com/codespaces/new?template_repository=pmndrs%2Fdrei" data-label="GitHub" data-logo="github">Open in Codespaces</mark></p>',
    )
  })
})

describe('rehypeBadge keeps badges inline', () => {
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

  it('keeps the text only of a badge written over several lines', async () => {
    expect(await render('<Badge color="tip">\n  a\n</Badge>\n<Badge>b</Badge>')).toBe(
      '<p><mark data-color="tip">a</mark> <mark>b</mark></p>',
    )
  })
})
