import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react'
import { matchSorter } from 'match-sorter'
import cn from 'classnames'
import { useRouter } from 'next/router'
import Link from 'next/link'

const Search = ({ allDocs }) => {
  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between flex-auto h-16 px-4 border-b border-gray-200">
        <input className="appearance-none w-full h-full p-4" type="search" id="algolia-search" />
      </div>
    </div>
  )
}

export default Search
