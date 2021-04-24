import removeMarkdown from 'utils/removeMarkdown'

export interface IHighlightProps {
  search: string
  title: string
  description: string
  content: string
}

/**
 * The maximum length of search preview text.
 */
export const PREVIEW_LENGTH = 100

/**
 * Trims search preview text and indicates truncated text.
 */
export const trimPreview = (preview: string) =>
  preview.length > PREVIEW_LENGTH ? `${preview.substring(0, PREVIEW_LENGTH)}...` : preview

/**
 * Traverses a search item, returning highlighted HTML.
 */
export const getHighlight = ({ search, title, description, content }: IHighlightProps) => {
  // Search match expression
  const match = new RegExp(search, 'gi')
  const isMatch = (text) => match.test(trimPreview(removeMarkdown(text)))

  // Show content if description does not match search
  const showContent = isMatch(content) && !isMatch(description)
  const preview = showContent ? content : description

  // Bolds matching text
  const highlight = (text) =>
    removeMarkdown(text).replace(
      match,
      (target: string) => `<span class="font-bold">${target}</span>`
    )

  // Create highlight HTML
  return {
    __html: `
      ${highlight(title)}
      <span class="block text-sm text-gray-600 pt-2">
        ${trimPreview(highlight(preview))}
      </span>
    `,
  }
}
