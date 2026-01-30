'use client'

import { createRequiredContext } from '@/lib/createRequiredContext'
import { ReactNode } from 'react'

export type DocToC = {
  id: string
  level: number
  title: string
  content: string
  url: string
  parent: DocToC | null
  label: string
}

export type Doc = {
  slug: string[]
  url: string
  editURL?: string
  sourcecode?: string
  sourcecodeURL?: string
  nav: number
  title: string
  titleJsx?: ReactNode
  description: string
  descriptionJsx?: ReactNode
  image: string
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
