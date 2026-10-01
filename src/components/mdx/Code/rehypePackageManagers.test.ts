import { compileMDX } from 'next-mdx-remote/rsc'
import { createElement, type ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import rehypePrismPlus from 'rehype-prism-plus'
import { describe, expect, it } from 'vitest'
import { rehypeCode } from './rehypeCode'
import { rehypePackageManagers } from './rehypePackageManagers'

/**
 * Runs the plugin with its neighbours of the docs pipeline, and renders `<Code>` as a `<pre>`
 * showing the package-manager props it receives.
 */
async function render(source: string) {
  const { content } = await compileMDX({
    source,
    options: {
      mdxOptions: { rehypePlugins: [rehypePackageManagers(), rehypePrismPlus, rehypeCode()] },
    },
    components: {
      Code: ({
        pnpm,
        npm,
        yarn,
        bun,
        children,
      }: ComponentProps<'pre'> & { pnpm?: string; npm?: string; yarn?: string; bun?: string }) =>
        createElement(
          'pre',
          { 'data-pnpm': pnpm, 'data-npm': npm, 'data-yarn': yarn, 'data-bun': bun },
          children,
        ),
    },
  })
  return renderToStaticMarkup(content)
}

describe('rehypePackageManagers', () => {
  it('gives a bash block of npm commands every package manager', async () => {
    const html = await render('```bash\nnpm install three\n```')
    expect(html).toContain('data-pnpm="pnpm add three"')
    expect(html).toContain('data-npm="npm install three"')
    expect(html).toContain('data-yarn="yarn add three"')
    expect(html).toContain('data-bun="bun add three"')
  })

  it.each(['sh', 'shell'])('does so for ```%s too', async (language) => {
    const html = await render(`\`\`\`${language}\nnpx create-vite my-app\n\`\`\``)
    expect(html).toContain('data-pnpm="pnpm create vite my-app"')
  })

  it('keeps every line of the block', async () => {
    const html = await render('```bash\n# deps\nnpm install three\nnpm run dev\n```')
    expect(html).toContain('data-yarn="# deps\nyarn add three\nyarn dev"')
  })

  it('leaves a block of other languages alone', async () => {
    const html = await render('```js\nnpm install three\n```')
    expect(html).not.toContain('data-pnpm')
  })

  it('leaves a fence without a language alone', async () => {
    const html = await render('```\nnpm install three\n```')
    expect(html).not.toContain('data-pnpm')
  })

  it('leaves a block with other commands alone', async () => {
    const html = await render('```bash\nnpm install three\ncd my-app\n```')
    expect(html).not.toContain('data-pnpm')
  })
})
