import { describe, expect, it } from 'vitest'
import { getPromptUrl } from './promptUrl'

/** The prompt a link carries, decoded. */
function promptOf(href: string) {
  return new URL(href).searchParams.get('q')
}

describe('getPromptUrl', () => {
  it('appends the prompt as `q` to the base URL', () => {
    const href = getPromptUrl('https://claude.ai/new', 'https://docs.pmnd.rs/intro', 'Poimandres')

    expect(href.startsWith('https://claude.ai/new?q=')).toBe(true)
    expect(promptOf(href)).toBe(
      `I’m looking at this Poimandres documentation: https://docs.pmnd.rs/intro.
Help me understand how to use it. Be ready to explain concepts, give examples, or help debug based on it.`,
    )
  })

  it('encodes the prompt as a single query parameter', () => {
    const href = getPromptUrl('https://chatgpt.com', 'https://example.com/a?b=c&d=e#f', 'Lib')

    expect(href).not.toContain(' ')
    expect(new URL(href).searchParams.size).toBe(1)
    expect(promptOf(href)).toContain('https://example.com/a?b=c&d=e#f.')
  })

  it('falls back to "this documentation" without a library name', () => {
    expect(promptOf(getPromptUrl('https://chatgpt.com', 'https://example.com/x'))).toMatch(
      /^I’m looking at this documentation: https:\/\/example\.com\/x\./,
    )
    expect(promptOf(getPromptUrl('https://chatgpt.com', 'https://example.com/x', ''))).toMatch(
      /^I’m looking at this documentation:/,
    )
  })
})
