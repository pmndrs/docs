import { expect, test } from 'vitest'
import { renderMarkdown } from './renderMarkdown'

test('retains fence metadata and literal braces, autolinks and JSX inside code', async () => {
  const code = 'const example = { url: "<https://example.com>", jsx: "<Button />" }'
  const markdown = await renderMarkdown(
    `\`\`\`tsx title="src/example.tsx" {1} collapsible\n${code}\n\`\`\``,
  )
  expect(markdown).toContain('```tsx title="src/example.tsx" {1} collapsible')
  expect(markdown).toContain(code)
})

test('restores repeated footnote references and definitions with rich contents', async () => {
  const markdown = await renderMarkdown(
    'First[^note], again[^note].\n\n[^note]: **Important** [link](https://example.com).\n\n    Another paragraph.',
  )
  expect(markdown).toContain('First[^note], again[^note].')
  expect(markdown).toContain('[^note]: **Important** [link](https://example.com).')
  expect(markdown).toContain('Another paragraph.')
  expect(markdown).not.toContain('user-content-fn')
  expect(markdown).not.toContain('## Footnotes')
  expect(markdown).not.toContain('↩')
})

test('parses autolinks at the start of a paragraph and within JSX while leaving code alone', async () => {
  const markdown = await renderMarkdown(
    [
      '<https://example.com/path>',
      '',
      'Visit <https://example.com/next>.',
      '',
      '<div>\n<https://example.com/nested>\n</div>',
      '',
      'Use `<https://example.com/literal>`.',
    ].join('\n'),
  )
  expect(markdown).toContain('https://example.com/path')
  expect(markdown).toContain('https://example.com/next')
  expect(markdown).toContain('https://example.com/nested')
  expect(markdown).toContain('`<https://example.com/literal>`')
})

test('preserves task completion states and separates adjacent inline badges inside JSX', async () => {
  const markdown = await renderMarkdown(
    [
      '- [x] Completed',
      '- [ ] Pending',
      '',
      '<Intro>',
      '<Badge>primary</Badge>',
      '<Badge>secondary</Badge>',
      '</Intro>',
    ].join('\n'),
  )
  expect(markdown).toContain('- [x] Completed')
  expect(markdown).toContain('- [ ] Pending')
  expect(markdown).toContain('primary secondary')
  expect(markdown).not.toContain('<!-- -->')
})
