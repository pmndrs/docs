import { createElement, forwardRef, memo } from 'react'
import { expect, test } from 'vitest'
import { validateDocsConfig } from './config'

test('accepts plain, async and wrapped React components with shared structured data', () => {
  const components = {
    Plain: () => createElement('div'),
    Async: async () => createElement('div'),
    Memo: memo(function Memo() {
      return createElement('div')
    }),
    ForwardRef: forwardRef<HTMLDivElement>(function ForwardRef(_, ref) {
      return createElement('div', { ref })
    }),
  }
  const data = { spacing: [0, 4, 8] }
  const config = validateDocsConfig({ components, markdownComponents: components, scope: { data } })
  expect(config.components?.Plain).toBe(components.Plain)
  expect(config.components?.Memo).toBe(components.Memo)
  expect(config.markdownComponents?.Async).toBe(components.Async)
  expect(config.scope?.data).toBe(data)
})

test.each(['bad-key', '1data', 'opts', 'frontmatter', '_jsxDEV', 'MDXContent', 'return', 'eval'])(
  'rejects the invalid or reserved scope name %s before MDX compilation',
  (name) => {
    expect(() => validateDocsConfig({ scope: { [name]: {} } })).toThrow()
  },
)

test.each([
  null,
  [],
  { components: { Invalid: 42 } },
  { markdownComponents: { Invalid: 42 } },
  { scope: [] },
])('rejects malformed consumer configuration %j', (value) => {
  expect(() => validateDocsConfig(value)).toThrow()
})

test('rejects an own __proto__ scope key instead of silently dropping its value', () => {
  expect(() =>
    validateDocsConfig({ scope: JSON.parse('{"__proto__":"consumer-value"}') }),
  ).toThrowError(
    expect.objectContaining({
      issues: expect.arrayContaining([expect.objectContaining({ path: ['scope', '__proto__'] })]),
    }),
  )
})
