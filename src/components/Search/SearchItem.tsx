import Icon from '@/components/Icon'
import cn from '@/lib/cn'
import { highlight } from '@/utils/text'
import Link from 'next/link'
import { ComponentProps } from 'react'
import sanitizeHtml from 'sanitize-html'

export interface SearchResult {
  title: string
  content: string
  url: string
  label: string
  image?: string
}

export interface SearchItemProps {
  search: string
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

function SearchItem({
  className,
  search,
  result,
  ...props
}: Omit<ComponentProps<typeof Link>, 'href'> & SearchItemProps) {
  return (
    <Link
      {...props}
      href={result.url}
      className={cn(className, 'block no-underline')}
      target={result.url.startsWith('http') ? '_blank' : undefined}
    >
      <div className="flex items-center justify-between rounded-md p-4 py-5">
        <div className="break-all pr-3">
          <div className="text-on-surface-variant/50 block pb-1 text-xs">{result.label}</div>
          <span
            dangerouslySetInnerHTML={{
              __html: highlight(sanitizeAllHtmlButMark(result.title), search),
            }}
          />
          <div className="text-on-surface-variant/50 block pt-2 text-sm">
            <span
              dangerouslySetInnerHTML={{
                __html: highlight(sanitizeAllHtmlButMark(result.content), search),
              }}
            />
          </div>
        </div>
        {result.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="max-w-[40%] rounded" src={result.image} alt={result.title} />
        ) : (
          <Icon icon="enter" />
        )}
      </div>
    </Link>
  )
}

export default SearchItem
