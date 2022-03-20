import { useSpring, a } from 'react-spring'
import { SearchIcon } from 'components/Icons'
import SearchItem from './SearchItem'
import type { Doc } from 'utils/docs'

const SearchModal = ({ search, results, close, onChange }) => {
  const renderList = results.length > 0

  const { opacity } = useSpring({
    opacity: 1,
    config: {
      tension: 280,
      friction: 28,
    },
  })

  return (
    <a.div className="absolute top-0 left-0 bottom-0 right-0 h-screen z-99" style={{ opacity }}>
      <button className="opacity-50 bg-gray-900 w-full h-screen" onClick={close}></button>
      <div className="absolute top-20 left-2/4 w-[500px] max-w-[90%] z-100 -translate-x-1/2 transform">
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="search"
            name="search"
            id="search"
            className={`outline-none focus:ring-gray-200 focus:border-gray-200 block w-full pl-10 sm:text-sm border-gray-300 bg-white px-4 py-6 text-gray-700 ${
              renderList ? 'rounded-t-md' : 'rounded-md'
            }`}
            autoComplete="off"
            autoFocus
            placeholder="Search the docs"
            onChange={onChange}
          />

          {renderList && (
            <ul className="list-none p-0 m-0 absolute left-0 bg-white pb-1 z-2 w-full rounded-b-md">
              {(results as Doc[]).map((result, index) => (
                <SearchItem key={`search-item-${index}`} search={search} {...result} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </a.div>
  )
}

export default SearchModal
