import * as React from 'react'

export interface DocToC {
  id: string
  level: number
  title: string
  description: string
  url: string
  parent?: DocToC
}

export interface Doc {
  slug: string[]
  url: string
  editURL: string
  nav: number
  title: string
  description: string
  content: string
  tableOfContents: DocToC[]
}

export const DocsContext = React.createContext<Doc[]>(null!)

export function useDocs() {
  return React.useContext(DocsContext)
}
