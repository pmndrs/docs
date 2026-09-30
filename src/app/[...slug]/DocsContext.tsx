'use client'

import type { Box } from '@/components/mdx/Codesandbox/rehypeCodesandbox'
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

export type DocMetadata = {
  title: string
  description: string
}

export type Doc = {
  slug: string[]
  url: string
  editURL?: string
  sourcecode?: string
  sourcecodeURL?: string
  nav: number
  title?: ReactNode
  description?: ReactNode
  metadata: DocMetadata
  image: string
  content: ReactNode
  boxes: Box[]
  tableOfContents: DocToC[]
}

export type Ctx = { docs: Doc[]; doc: Doc }

const [hook, Provider] = createRequiredContext<Ctx>()

export { hook as useDocs }

export function DocsContext({ children, value }: { children?: ReactNode; value: Ctx }) {
  return <Provider value={value}>{children}</Provider>
}
