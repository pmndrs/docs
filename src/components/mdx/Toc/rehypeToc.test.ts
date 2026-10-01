import rehypeParse from 'rehype-parse'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'
import type { DocToC } from '@/app/[...slug]/DocsContext'
import { rehypeToc } from './rehypeToc'

const toc = (html: string) => {
  const target: DocToC[] = []
  const processor = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeToc(target, '/page', 'Page'))
  processor.runSync(processor.parse(html))
  return target
}

const count = (text: string, search: string) => text.split(search).length - 1

describe('rehypeToc', () => {
  it('includes each paragraph after a heading exactly once in its content', () => {
    const [heading] = toc('<h2>Title</h2><p>first paragraph</p><p>second paragraph</p>')

    expect(count(heading.content, 'first paragraph')).toBe(1)
    expect(count(heading.content, 'second paragraph')).toBe(1)
  })
})
