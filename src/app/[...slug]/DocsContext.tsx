'use client'

import { ReactNode } from 'react'
import { createRequiredContext } from '@/lib/createRequiredContext'

export type DocToC = {
  id: string
  level: number
  title: string
  description: string
  // content: string
  url: string
  parent: DocToC | null
  label: string
}

export type Doc = {
  slug: string[]
  url: string
  editURL?: string
  nav: number
  title: string
  description: string
  content: ReactNode
  boxes: string[]
  tableOfContents: DocToC[]
}

export type Ctx = { docs: Doc[]; doc: Doc }

const [hook, Provider] = createRequiredContext<Ctx>()

export { hook as useDocs }

export function DocsContext({ children, value }: { children?: ReactNode; value: Ctx }) {
  return <Provider value={value}>{children}</Provider>
}
