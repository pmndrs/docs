import { EnterIcon } from 'components/Icons'
import Link from 'next/link'
import titleCase from 'utils/titleCase'
import removeMarkdown from 'utils/removeMarkdown'
import highlight from 'utils/highlight'

// Trim search preview text
const PREVIEW_LENGTH = 100
const trimPreview = (preview: string) =>
  preview.length > PREVIEW_LENGTH ? `${preview.substring(0, PREVIEW_LENGTH)}...` : preview

const SearchItem = ({ title, url, search, multipleLibs, description, content }) => {
  // Name of lib in multi-lib search
  const lib = titleCase(url.split('/')[1].replaceAll('-', ' '))

  // Case-insensitive search match expression
  const match = new RegExp(search, 'gi')
  const isMatch = (text: string) => match.test(trimPreview(removeMarkdown(text)))

  // Show content if description does not match search
  const showContent = isMatch(content) && !isMatch(description)
  const preview = showContent ? removeMarkdown(content) : description

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
                    ${highlight(title, match)}
                    <span class="block text-sm text-gray-600 pt-2">
                      ${highlight(trimPreview(preview), match)}
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
