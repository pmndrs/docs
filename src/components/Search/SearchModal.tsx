import * as React from 'react'
import Icon from '@/components/Icon'
import SearchItem, { SearchResult } from './SearchItem'
import cn from '@/lib/cn'

export interface SearchModelProps {
  search: string
  results: SearchResult[]
  onClose: React.MouseEventHandler<HTMLButtonElement>
  onChange: React.ChangeEventHandler<HTMLInputElement>
}

function SearchModal({ search, results, onClose, onChange }: SearchModelProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 top-0 z-[99] h-screen w-screen">
      <button type="button" className="0 h-full w-full bg-surface-dim/80" onClick={onClose} />

      <div className="z-100 absolute bottom-20 left-2/4 top-20 w-[500px] max-w-[90%] -translate-x-1/2 transform overflow-y-auto">
        <div className="relative mt-1 rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon
              icon="search"
              // className="text-gray-300"
            />
          </div>
          <input
            type="search"
            name="search"
            id="search"
            className={cn(
              'bg-surface-container block w-full px-4 py-6 pl-10 outline-none sm:text-sm',
              results.length > 0 ? 'rounded-t-md' : 'rounded-md',
            )}
            autoComplete="off"
            autoFocus
            placeholder="Search the docs"
            onChange={onChange}
          />

          {results.length > 0 && (
            <ul className="z-2 bg-surface-container absolute left-0 m-0 w-full list-none rounded-b-md p-0 pb-1">
              {results.map((result, index) => (
                <SearchItem key={`search-item-${index}`} search={search} result={result} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchModal
