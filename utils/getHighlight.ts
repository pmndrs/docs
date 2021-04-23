import removeMarkdown from 'utils/removeMarkdown'

export interface IHighlightProps {
  title: string
  search: string
  description: string
  content: string
}

const PREVIEW_LENGTH = 100

/**
 * Traverses a search item, returning highlighted HTML.
 */
const getHighlight = ({ search, title, description, content }: IHighlightProps) => {
  // Case-insensitive match expression
  const match = new RegExp(search, 'gi')

  // Traverse meta for matching content
  const { type, result } = Object.entries({ title, description, content }).reduce(
    (previous, [type, value]) => {
      // Early return if match found or if not matching
      if (previous.result || !match.test(value)) return previous

      // Insert highlights around matching text
      const preview = removeMarkdown(value)
      const result = preview
        .substring(0, PREVIEW_LENGTH)
        .replace(match, (target: string) => `<span class="font-bold">${target}</span>`)

      return { type, result: preview.length > PREVIEW_LENGTH ? `${result}...` : result }
    },
    { type: null, result: null }
  )

  return `
    ${type === 'title' ? result : title}
    <span class="block text-sm text-gray-600 pt-2">
      ${type === 'title' ? description.substring(0, PREVIEW_LENGTH) : result}
    </span>
  `
}

export default getHighlight
