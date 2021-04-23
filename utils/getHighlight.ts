import removeMarkdown from 'utils/removeMarkdown'

type getHighlightProps = { title: string; search: string; description: string; content: string }

const getHighlight = ({ title, search, description, content }: getHighlightProps) => {
  const s = search.toLowerCase()
  const extraChars = 20

  const getSearchedWord = (highlight: number) => highlight + search.length

  if (title.toLowerCase().includes(s)) {
    const highlight = title.toLowerCase().indexOf(s)
    return {
      type: 'title',
      results: [
        title.substring(0, highlight),
        title.substring(highlight, getSearchedWord(highlight)),
        title.substring(getSearchedWord(highlight)),
      ],
    }
  }
  if (description.toLowerCase().includes(s)) {
    const highlight = description.toLowerCase().indexOf(s)
    return {
      type: 'description',
      results: [
        description.substring(highlight - extraChars, highlight),
        description.substring(highlight, getSearchedWord(highlight)),
        description.substring(getSearchedWord(highlight), getSearchedWord(highlight) + extraChars),
      ],
    }
  }

  if (content.toLowerCase().includes(s)) {
    const highlight = content.toLowerCase().indexOf(s)
    return {
      type: 'content',
      results: [
        removeMarkdown(content.substring(highlight - extraChars, highlight)),
        removeMarkdown(content.substring(highlight, getSearchedWord(highlight))),
        removeMarkdown(
          content.substring(getSearchedWord(highlight), getSearchedWord(highlight) + extraChars)
        ),
      ],
    }
  }

  return {}
}

export default getHighlight
