import Link from 'next/link'
import Icon from 'components/Icon'
import { highlight } from 'utils/text'

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
    <Link href={result.url}>
      <a
        className="block no-underline search-item outline-none"
        target={result.url.startsWith('http') ? '_blank' : undefined}
      >
        <li className="px-2 py-1">
          <div className="p-4 py-5 rounded-md bg-gray-100 hover:bg-gray-800 hover:text-gray-200 flex justify-between items-center transition-all">
            <span
              className="pr-3"
              dangerouslySetInnerHTML={{
                __html: `
                  <span class="block text-xs text-gray-400 pb-1">${result.label}</span>
                  ${highlight(result.title, search)}
                  <span class="block text-sm text-gray-600 pt-2">
                    ${highlight(result.description, search)}
                  </span>
                `,
              }}
            />
            {result.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="rounded max-w-[40%]" src={result.image} alt={result.title} />
            ) : (
              <Icon icon="enter" className="text-gray-400" />
            )}
          </div>
        </li>
      </a>
    </Link>
  )
}

export default SearchItem
