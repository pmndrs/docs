import Link from 'next/link'
import { EnterIcon } from 'components/Icons'
import { titleCase, highlight } from 'utils/text'

const SearchItem = ({ url, multipleLibs, search, title, description }) => {
  const lib = titleCase(url.split('/')[1].replace(/\-/g, ' '))

  return (
    <Link href={url}>
      <a className="block no-underline search-item outline-none">
        <li className="px-2 py-1">
          <div className="p-4 py-5 rounded-md bg-gray-100 hover:bg-gray-800 hover:text-gray-200 flex justify-between items-center transition-all">
            <span>
              {multipleLibs && (
                <span className="text-xs font-light text-gray-500 block pb-1">{lib}</span>
              )}
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
            </span>
            <EnterIcon />
          </div>
        </li>
      </a>
    </Link>
  )
}

export default SearchItem
