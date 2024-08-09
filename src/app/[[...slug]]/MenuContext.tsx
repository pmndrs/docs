'use client'

import { Dispatch, ReactNode, SetStateAction, useState } from 'react'

import { createRequiredContext } from '@/lib/createRequiredContext'

export type Ctx = [boolean, Dispatch<SetStateAction<boolean>>]

const [hook, Provider] = createRequiredContext<Ctx>()

export { hook as useMenu }

export function MenuContext({ children }: { children?: ReactNode }) {
  const state = useState(false)

  return <Provider value={state}>{children}</Provider>
}
