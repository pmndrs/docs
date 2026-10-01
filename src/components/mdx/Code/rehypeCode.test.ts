import { compileMDX } from 'next-mdx-remote/rsc'
import { createElement, type ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import rehypePrismPlus from 'rehype-prism-plus'
import { describe, expect, it } from 'vitest'
import { parseCollapsible, parseTitle, rehypeCode } from './rehypeCode'
import { rehypePackageManagers } from './rehypePackageManagers'

/**
 * Runs the plugin with its neighbours of the docs pipeline, and renders `<Code>` as a `<pre>`
 * showing the title it receives.
 */
async function render(source: string) {
  const { content } = await compileMDX({
    source,
    options: {
      mdxOptions: { rehypePlugins: [rehypePackageManagers(), rehypePrismPlus, rehypeCode()] },
    },
    components: {
      Code: ({ title, collapsible, children }: ComponentProps<'pre'> & { collapsible?: boolean }) =>
        createElement(
          'pre',
          { 'data-title': title, 'data-collapsible': collapsible === true ? 'true' : undefined },
          children,
        ),
    },
  })
  return renderToStaticMarkup(content)
}

describe('parseTitle', () => {
  it('reads a double-quoted title', () => {
    expect(parseTitle('title="lib/utils.ts"')).toBe('lib/utils.ts')
  })

  it('reads a single-quoted title', () => {
    expect(parseTitle("title='lib/utils.ts'")).toBe('lib/utils.ts')
  })

  it('reads it among other meta', () => {
    expect(parseTitle('{1,4-6} title="src/app.tsx" showLineNumbers')).toBe('src/app.tsx')
  })

  it('keeps spaces in the title', () => {
    expect(parseTitle('title="my file.ts"')).toBe('my file.ts')
  })

  it('reads no title from other attributes ending in title', () => {
    expect(parseTitle('subtitle="nope"')).toBeUndefined()
  })

  it.each([undefined, '', 'showLineNumbers', 'title=""', 'title=unquoted.ts'])(
    'reads no title from %j',
    (meta) => {
      expect(parseTitle(meta)).toBeUndefined()
    },
  )
})

describe('parseCollapsible', () => {
  it.each(['collapsible', 'title="globals.css" collapsible', '{1} collapsible showLineNumbers'])(
    'finds the flag in %j',
    (meta) => {
      expect(parseCollapsible(meta)).toBe(true)
    },
  )

  it.each([undefined, '', 'title="collapsible.ts"', "title='a collapsible b'", 'notcollapsible'])(
    'finds no flag in %j',
    (meta) => {
      expect(parseCollapsible(meta)).toBe(false)
    },
  )
})

describe('rehypeCode', () => {
  it('gives <Code> the title of the fence', async () => {
    const html = await render('```ts title="lib/utils.ts"\nexport const a = 1\n```')
    expect(html).toContain('data-title="lib/utils.ts"')
  })

  it('keeps line highlights and numbers next to the title', async () => {
    const html = await render(
      '```tsx {1} title="src/app.tsx" showLineNumbers\nconst a = 1\nconst b = 2\n```',
    )
    expect(html).toContain('data-title="src/app.tsx"')
    expect(html).toContain('highlight-line')
    expect(html).toContain('line-number')
  })

  it('gives <Code> the collapsible flag, with a title or without', async () => {
    const titled = await render('```css title="globals.css" collapsible\n:root {}\n```')
    expect(titled).toContain('data-title="globals.css"')
    expect(titled).toContain('data-collapsible="true"')

    const untitled = await render('```css collapsible\n:root {}\n```')
    expect(untitled).not.toContain('data-title')
    expect(untitled).toContain('data-collapsible="true"')
  })

  it('does not make a fence collapsible without the flag', async () => {
    const html = await render('```css title="globals.css"\n:root {}\n```')
    expect(html).not.toContain('data-collapsible')
  })

  it('gives no title to a fence without one', async () => {
    const html = await render('```ts\nexport const a = 1\n```')
    expect(html).not.toContain('data-title')
  })
})
