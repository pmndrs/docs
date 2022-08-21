import create from 'zustand'

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

export interface DocState {
  docs: Doc[]
  setDocs: (doc: Doc[]) => void
  getPrevAndNext: (asPath: string) => {
    previousPage: Doc
    nextPage: Doc
    currentPageIndex: number
  }
}

export const useDocs = create<DocState>((set, get) => ({
  docs: [],
  setDocs: (docs: Doc[]) => set({ docs }),
  getPrevAndNext: (asPath: string) => {
    const currentPageIndex = get().docs.findIndex((item) => item.url === asPath)
    const previousPage = currentPageIndex > 0 && get().docs[currentPageIndex - 1]
    const nextPage = currentPageIndex < get().docs.length - 1 && get().docs[currentPageIndex + 1]
    return {
      previousPage,
      nextPage,
      currentPageIndex,
    }
  },
}))
