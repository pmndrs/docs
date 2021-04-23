import { EnterIcon } from 'components/Icons'
import Link from 'next/link'
import removeMarkdown from 'utils/removeMarkdown'
import titleCase from 'utils/titleCase'

const getHighlight = ({ title, search, description, content }) => {
  const s = search.toLowerCase()

  if (title.toLowerCase().includes(s)) {
    return {
      type: 'title',
      highlight: title.toLowerCase().indexOf(s),
    }
  }
  if (description.toLowerCase().includes(s)) {
    return {
      type: 'description',
      highlight: description.toLowerCase().indexOf(s),
    }
  }

  if (content.toLowerCase().includes(s)) {
    return {
      type: 'content',
      highlight: content.toLowerCase().indexOf(s),
    }
  }

  return {}
}

const Item = ({ title, url, search, multipleLibs, description, content }) => {
  const { type, highlight } = getHighlight({ search, title, description, content })
  const name = titleCase(url.split('/')[1].split('-').join(' '))

  return (
    <Link href={url}>
      <a className="block no-underline search-item outline-none">
        <li className={'px-2 py-1'}>
          <div className="  p-4 py-5 rounded-md bg-gray-100 hover:bg-gray-800 hover:text-gray-200  flex justify-between items-center transition-all">
            <span>
              {multipleLibs ? (
                <span className="text-xs font-light text-gray-500 block pb-1">{name}</span>
              ) : null}
              {highlight !== -1 && type === 'title' ? (
                <>
                  {title.substring(0, highlight)}
                  <span className="font-bold">
                    {title.substring(highlight, highlight + search.length)}
                  </span>
                  {title.substring(highlight + search.length)}
                  <span className="block  text-sm text-gray-600 pt-2">
                    {description.substring(0, 100)}
                  </span>
                </>
              ) : (
                title
              )}

              {highlight !== -1 && type === 'description' ? (
                <span className="block  text-sm text-gray-600 pt-2">
                  {description.substring(highlight - 20, highlight)}
                  <span className="font-bold">
                    {description.substring(highlight, highlight + search.length)}
                  </span>
                  {description.substring(highlight + search.length, highlight + search.length + 20)}
                </span>
              ) : null}

              {highlight !== -1 && type === 'content' ? (
                <span className="block  text-sm text-gray-600 pt-2">
                  {removeMarkdown(content.substring(highlight - 20, highlight))}
                  <span className="font-bold">
                    {removeMarkdown(content.substring(highlight, highlight + search.length))}
                  </span>
                  {removeMarkdown(
                    content.substring(highlight + search.length, highlight + search.length + 20)
                  )}
                </span>
              ) : null}
            </span>
            <EnterIcon />
          </div>
        </li>
      </a>
    </Link>
  )
}

export default Item
