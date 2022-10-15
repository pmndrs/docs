import * as React from 'react'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'

export interface DocToC {
  id: string
  level: number
  title: string
  description: string
  url: string
  parent: DocToC | null
  label: string
}

export interface Doc {
  slug: string[]
  url: string
  editURL: string
  nav: number
  title: string
  description: string
  source: MDXRemoteSerializeResult
  boxes: string[]
  tableOfContents: DocToC[]
  boxes: string[]
}

export const DocsContext = React.createContext<Doc[]>(null!)

export function useDocs() {
  return React.useContext(DocsContext)
}
