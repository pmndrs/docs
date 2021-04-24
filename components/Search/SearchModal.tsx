import { useSpring, a } from '@react-spring/web'
import { SearchIcon } from 'components/Icons'
import Item from './Item'

const SearchModal = ({ search, results, close, onChange, isThreeD }) => {
  const renderList = results.length > 0

  const { opacity } = useSpring({
    opacity: 1,
    config: {
      tension: 280,
      friction: 28,
    },
  })

  return (
    <a.div
      className="absolute top-0 left-0 bottom-0 right-0 h-screen"
      css={`
        z-index: 99;
      `}
      style={{ opacity }}
    >
      <button className="opacity-50 bg-gray-900 w-full h-screen" onClick={close}></button>
      <div
        className="absolute top-20 left-2/4"
        css={`
          max-width: 90%;
          width: 500px;
          transform: translateX(-50%);
          z-index: 100;
        `}
      >
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="search"
            name="search"
            id="search"
            className={`outline-none focus:ring-gray-200 focus:border-gray-200 block w-full pl-10 sm:text-sm border-gray-300  bg-white px-4 py-6 text-gray-700 ${
              renderList ? 'rounded-t-md' : 'rounded-md'
            }`}
            autoComplete="off"
            autoFocus
            placeholder="Search the docs"
            onChange={onChange}
          />

          {renderList && (
            <ul className="list-none p-0 m-0 absolute left-0 bg-white pb-1 z-2 w-full rounded-b-md">
              {results.map((result, index) => (
                <Item
                  key={`search-item-${index}`}
                  search={search}
                  multipleLibs={isThreeD}
                  {...result}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </a.div>
  )
}

export default SearchModal
