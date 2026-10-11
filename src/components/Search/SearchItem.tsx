import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { excerpt, highlight } from '@/utils/text'
import { CornerDownLeftIcon } from 'lucide-react'
import { ComponentProps } from 'react'
import sanitizeHtml from 'sanitize-html'

/** Searchable documentation content and its destination. */
export interface SearchResult {
  /** Heading text, possibly containing author markup. */
  title: string
  /** Content used to produce the highlighted excerpt. */
  content: string
  /** Destination handled by the containing CommandItem. */
  url: string
  /** Document label displayed above the heading. */
  label: string
  /** Optional preview image. */
  image?: string
}

/** Content presented inside the command palette's selected result. */
export interface SearchItemProps {
  /** Current query used to highlight the result. */
  search: string
  /** Matching document content. */
  result: SearchResult
}

function sanitizeAllHtmlButMark(str: string) {
  return sanitizeHtml(str, {
    allowedTags: ['mark'],
    allowedAttributes: false,
    disallowedTagsMode: 'escape',
    parseStyleAttributes: false,
  })
}

function SearchItem({ search, result, ...props }: ComponentProps<typeof Item> & SearchItemProps) {
  return (
    <Item size="sm" {...props}>
      <ItemContent className="min-w-0 break-words">
        <ItemDescription>{result.label}</ItemDescription>
        <ItemTitle className="line-clamp-none">
          <span
            dangerouslySetInnerHTML={{
              __html: highlight(sanitizeAllHtmlButMark(result.title), search),
            }}
          />
        </ItemTitle>
        <ItemDescription>
          <span
            dangerouslySetInnerHTML={{
              __html: highlight(sanitizeAllHtmlButMark(excerpt(result.content, search)), search),
            }}
          />
        </ItemDescription>
      </ItemContent>
      <ItemMedia variant={result.image ? 'image' : 'icon'}>
        {result.image ? (
          <img src={result.image} alt={result.title} />
        ) : (
          <CornerDownLeftIcon aria-hidden />
        )}
      </ItemMedia>
    </Item>
  )
}

export default SearchItem
