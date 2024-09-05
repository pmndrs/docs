'use client'

import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { createRequiredContext } from '@/lib/createRequiredContext'
import { Dispatch, ElementRef, ReactNode, SetStateAction, useEffect, useRef, useState } from 'react'

export type Ctx = [boolean, Dispatch<SetStateAction<boolean>>]

const [hook, Provider] = createRequiredContext<Ctx>()

export { hook as useMenu }

export function MenuContext({ children }: { children?: ReactNode }) {
  const state = useState(false)

  const [opened, setOpened] = state
  const dialogRef = useRef<ElementRef<'dialog'>>(null)

  useEffect(() => {
    if (opened) {
      dialogRef.current?.show()
    } else {
      dialogRef.current?.close()
    }
  }, [opened])

  useLockBodyScroll(opened)

  return <Provider value={state}>{children}</Provider>
}
