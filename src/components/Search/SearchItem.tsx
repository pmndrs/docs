import Icon from '@/components/Icon'
import { highlight } from '@/utils/text'
import Link from 'next/link'
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
  })
}

function SearchItem({ search, result }: SearchItemProps) {
  return (
    <Link
      href={result.url}
      className="search-item block no-underline outline-none"
      target={result.url.startsWith('http') ? '_blank' : undefined}
    >
      <li className="px-2 py-1">
        <div className="interactive-bg-surface-container-high flex items-center justify-between rounded-md p-4 py-5 transition-colors">
          <div
            className="break-all pr-3"
            // dangerouslySetInnerHTML={{
            //   __html: `

            //     `,
            // }}
          >
            <div className="block pb-1 text-xs text-on-surface-variant/50">${result.label}</div>
            <span
              dangerouslySetInnerHTML={{
                __html: sanitizeAllHtmlButMark(highlight(result.title, search)),
              }}
            />
            <div className="block pt-2 text-sm text-on-surface-variant/50">
              <span
                dangerouslySetInnerHTML={{
                  __html: sanitizeAllHtmlButMark(highlight(result.content, search)),
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
      </li>
    </Link>
  )
}

export default SearchItem
