'use client'

import * as React from 'react'
import { CiDark, CiLight } from 'react-icons/ci'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import cn from '@/lib/cn'
import { ComponentProps } from 'react'

const ToggleTheme = (props: ComponentProps<'button'>) => {
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
      className={cn('', props.className)}
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
