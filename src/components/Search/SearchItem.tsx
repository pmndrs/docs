import Link from 'next/link'
import Image from 'next/image'
import Icon from 'components/Icon'
import { highlight } from 'utils/text'
import { SearchResult } from './index'

export interface SearchItemProps {
  search: string
  result: SearchResult
}

function SearchItemMeta({ search, result }: SearchItemProps) {
  return (
    <span
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
  )
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
            {result.image ? (
              <div style={{ display: 'grid', gridTemplateColumns: '60% 40%' }}>
                <SearchItemMeta search={search} result={result} />
                <div className="pt-3 pl-3">
                  <Image
                    className="rounded"
                    src={result.image}
                    placeholder="empty"
                    alt={result.title}
                    width={1763}
                    height={926}
                    loading="eager"
                  />
                </div>
              </div>
            ) : (
              <>
                <SearchItemMeta search={search} result={result} />
                <Icon icon="enter" className="text-gray-400" />
              </>
            )}
          </div>
        </li>
      </a>
    </Link>
  )
}

export default SearchItem
