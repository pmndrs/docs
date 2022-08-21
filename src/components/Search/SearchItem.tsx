import Link from 'next/link'
import Icon from 'components/Icon'
import { highlight } from 'utils/text'

export interface SearchResult {
  title: string
  description: string
  url: string
}

export interface SearchItemProps {
  search: string
  result: SearchResult
}

function SearchItem({ search, result }: SearchItemProps) {
  return (
    <Link href={result.url}>
      <a className="block no-underline search-item outline-none">
        <li className="px-2 py-1">
          <div className="p-4 py-5 rounded-md bg-gray-100 hover:bg-gray-800 hover:text-gray-200 flex justify-between items-center transition-all">
            <span
              dangerouslySetInnerHTML={{
                __html: `
                ${highlight(result.title, search)}
                <span class="block text-sm text-gray-600 pt-2">
                  ${highlight(result.description, search)}
                </span>
              `,
              }}
            />
            <Icon icon="enter" className="text-gray-400" />
          </div>
        </li>
      </a>
    </Link>
  )
}

export default SearchItem
