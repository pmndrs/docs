import Link from 'next/link'
import titleCase from 'utils/titleCase'

const Item = ({ title, href, search, multipleLibs }) => {
  const highlight = title.toLowerCase().indexOf(search.toLowerCase())
  const name = titleCase(href.split('/')[1].split('-').join(' '))
  return (
    <Link href={href}>
      <a className="block no-underline search-item outline-none">
        <li className={'px-2 py-1'}>
          <div className="  p-4 py-5 rounded-md bg-gray-100 hover:bg-gray-800 hover:text-gray-200  flex justify-between items-center transition-all">
            <span>
              {multipleLibs ? (
                <span className="text-xs font-light text-gray-500 block pb-1">{name}</span>
              ) : null}
              {highlight !== -1 ? (
                <>
                  {title.substring(0, highlight)}
                  <span className="font-bold">
                    {title.substring(highlight, highlight + search.length)}
                  </span>
                  {title.substring(highlight + search.length)}
                </>
              ) : (
                title
              )}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="h-5 w-5 text-gray-400"
            >
              <polyline points="9 10 4 15 9 20"></polyline>
              <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
            </svg>
          </div>
        </li>
      </a>
    </Link>
  )
}

export default Item
