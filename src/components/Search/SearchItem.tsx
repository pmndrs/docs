import Link from 'next/link'
import Icon from '@/components/Icon'
import { highlight } from '@/utils/text'

export interface SearchResult {
  title: string
  description: string
  url: string
  label: string
  image?: string
}

export interface SearchItemProps {
  search: string
  result: SearchResult
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
          <span
            className="pr-3"
            dangerouslySetInnerHTML={{
              __html: `
                  <span class="block text-xs text-on-surface-variant/50 pb-1">${result.label}</span>
                  ${highlight(result.title, search)}
                  <span class="block text-sm text-on-surface-variant/50 pt-2">
                    ${highlight(result.description, search)}
                  </span>
                `,
            }}
          />
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
