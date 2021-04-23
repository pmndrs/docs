import { EnterIcon } from 'components/Icons'
import Link from 'next/link'
import getHighlight from 'utils/getHighlight'
import titleCase from 'utils/titleCase'

const Item = ({ title, url, search, multipleLibs, description, content }) => {
  const { type, result } = getHighlight({ search, title, description, content })
  const name = titleCase(url.split('/')[1].split('-').join(' '))

  return (
    <Link href={url}>
      <a className="block no-underline search-item outline-none">
        <li className={'px-2 py-1'}>
          <div className="  p-4 py-5 rounded-md bg-gray-100 hover:bg-gray-800 hover:text-gray-200  flex justify-between items-center transition-all">
            <span>
              {multipleLibs && (
                <span className="text-xs font-light text-gray-500 block pb-1">{name}</span>
              )}
              {result && type === 'title' ? (
                <>
                  {result[0]}
                  <span className="font-bold">{result[1]}</span>
                  {result[2]}
                  {type === 'title' ? (
                    <span className="block text-sm text-gray-600 pt-2">
                      {description.substring(0, 100)}
                    </span>
                  ) : null}
                </>
              ) : (
                title
              )}

              {result && type !== 'title' ? (
                <span className="block  text-sm text-gray-600 pt-2">
                  {result[0]}
                  <span className="font-bold">{result[1]}</span>
                  {result[2]}
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
