import { describe, expect, it } from 'vitest'
import type { Lib, Page } from '@/cli/browse.corpus'
import { excerpt, formatSearchResults, MAX_HITS } from './search-docs'

const drei: Lib = {
  name: 'drei',
  title: 'Drei',
  description: '',
  base: 'https://pmndrs.github.io/drei',
}

const page = (path: string, title: string, body: string, description?: string): Page => ({
  lib: drei,
  path,
  title,
  body,
  description,
})

describe('excerpt', () => {
  it('prefers the page description', () => {
    const hit = page('/a', 'A', 'Body mentions instances.', 'Draw thousands of meshes.')
    expect(excerpt(hit, 'instances')).toBe('Draw thousands of meshes.')
  })

  it('else takes the first prose line that mentions a term', () => {
    const hit = page('/a', 'A', '# Instances\n\nSome intro.\n\nUse <Instances> for many meshes.')
    expect(excerpt(hit, 'meshes')).toBe('Use <Instances> for many meshes.')
  })

  it('else takes the first prose line, skipping headings and fences', () => {
    const hit = page('/a', 'A', '# Title\n\n```tsx\nconst x = 1\n```\n\nThe actual intro.')
    expect(excerpt(hit, 'zzz')).toBe('The actual intro.')
  })

  it('is undefined for a page with no prose', () => {
    expect(excerpt(page('/a', 'A', '# Only a heading'), 'a')).toBeUndefined()
  })

  it('is one line, cut short', () => {
    const hit = page('/a', 'A', `${'word '.repeat(50)}\nnext line`)
    const summary = excerpt(hit, 'word')!
    expect(summary).not.toContain('\n')
    expect(summary.length).toBeLessThanOrEqual(160)
    expect(summary.endsWith('…')).toBe(true)
  })
})

describe('formatSearchResults', () => {
  const hits = [
    page('/performances/instances', 'Instances', '', 'Draw thousands of meshes in one call.'),
    page('/abstractions/text', 'Text', 'Renders text.'),
  ]

  it('numbers the hits, best first, with the lib and path to read each', () => {
    const text = formatSearchResults('instances', undefined, hits)
    expect(text).toBe(
      [
        '2 pages matching "instances", best first:',
        '',
        '1. lib="drei" path="/performances/instances" - Instances',
        '   Draw thousands of meshes in one call.',
        '2. lib="drei" path="/abstractions/text" - Text',
        '   Renders text.',
        '',
        'Next: call get_page_content(lib, path) with the lib and path of a hit above, verbatim, to read the page in full before answering.',
      ].join('\n'),
    )
  })

  it('names the library it was narrowed to', () => {
    expect(formatSearchResults('text', 'drei', hits.slice(1))).toContain(
      '1 page matching "text" in drei, best first:',
    )
  })

  it('caps the list and says how many there were', () => {
    const many = Array.from({ length: MAX_HITS + 5 }, (_, i) => page(`/p${i}`, `P${i}`, ''))
    const text = formatSearchResults('p', undefined, many)
    expect(text).toContain(`Top ${MAX_HITS} of ${MAX_HITS + 5} pages matching "p"`)
    expect(text).toContain(`${MAX_HITS}. lib="drei" path="/p${MAX_HITS - 1}"`)
    expect(text).not.toContain(`path="/p${MAX_HITS}"`)
  })

  it('tells what to try when nothing matches', () => {
    expect(formatSearchResults('zzz', undefined, [])).toBe(
      'No page matches "zzz".\nTry fewer or more general terms (the name of a component, hook or option works best).',
    )
    expect(formatSearchResults('zzz', 'drei', [])).toContain('or search without the lib filter.')
  })
})
