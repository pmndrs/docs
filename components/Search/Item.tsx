import { EnterIcon } from 'components/Icons'
import Link from 'next/link'
import getHighlight from 'utils/getHighlight'
import titleCase from 'utils/titleCase'

const Item = ({ title, url, search, multipleLibs, description, content }) => {
  const highlight = getHighlight({ search, title, description, content })
  const name = titleCase(url.split('/')[1].replaceAll('-', ' '))

  return (
    <Link href={url}>
      <a className="block no-underline search-item outline-none">
        <li className={'px-2 py-1'}>
          <div className="  p-4 py-5 rounded-md bg-gray-100 hover:bg-gray-800 hover:text-gray-200  flex justify-between items-center transition-all">
            <span>
              {multipleLibs && (
                <span className="text-xs font-light text-gray-500 block pb-1">{name}</span>
              )}
              {highlight && <span dangerouslySetInnerHTML={highlight} />}
            </span>
            <EnterIcon />
          </div>
        </li>
      </a>
    </Link>
  )
}

export default Item
