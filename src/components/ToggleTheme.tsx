'use client'

import * as React from 'react'
import { CiDark, CiLight } from 'react-icons/ci'
import { useTheme } from 'next-themes'
import Image from 'next/image'

const ToggleTheme = () => {
  const { setTheme, resolvedTheme } = useTheme()

  const [isDark, setIsDark] = React.useState<boolean | undefined>(undefined)
  React.useEffect(() => {
    switch (resolvedTheme) {
      case 'light':
        setIsDark(false)
        break
      case 'dark':
        setIsDark(true)
        break
      default:
        setIsDark(undefined)
        break
    }
  }, [resolvedTheme])

  return (
    <button
      className="flex h-9 w-9 items-center justify-center"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {isDark !== undefined ? (
        isDark ? (
          <CiLight size="21" />
        ) : (
          <CiDark size="21" />
        )
      ) : (
        <Image
          src={'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
          width={21}
          height={21}
          alt=""
        />
      )}
    </button>
  )
}

export default ToggleTheme
