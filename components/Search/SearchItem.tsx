import Link from 'next/link'
import { EnterIcon } from 'components/Icons'

/**
 * Bolds matching text, returning HTML.
 */
const highlight = (text: string, target: string | RegExp) =>
  text.replace(
    typeof target === 'string' ? new RegExp(target, 'gi') : target,
    (match: string) => `<span class="font-bold">${match}</span>`
  )

const SearchItem = ({ url, search, title, description }) => (
  <Link href={url}>
    <a className="block no-underline search-item outline-none">
      <li className="px-2 py-1">
        <div className="p-4 py-5 rounded-md bg-gray-100 hover:bg-gray-800 hover:text-gray-200 flex justify-between items-center transition-all">
          <span
            dangerouslySetInnerHTML={{
              __html: `
                ${highlight(title, search)}
                <span class="block text-sm text-gray-600 pt-2">
                  ${highlight(description, search)}
                </span>
              `,
            }}
          />
          <EnterIcon />
        </div>
      </li>
    </a>
  </Link>
)

export default SearchItem
