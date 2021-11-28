import create from 'zustand'

export type Doc = {
  title?: string
  description?: string
  nav?: number
  slug: string[]
  url: string
  editURL: string
  content: string
  data: { [key: string]: any }
}

export type DocState = {
  docs: Doc[]
  currentDocs: Doc[]
  setDocs: (doc: Doc[]) => void
  setCurrentDocs: (folder: string) => void
  getPrevAndNext: (folder: string) => {
    previousPage: Doc
    nextPage: Doc
    currentPageIndex: number
  }
}

export const useDocs = create<DocState>((set, get) => ({
  docs: [],
  currentDocs: [],
  setDocs: (docs: Doc[]) => set({ docs }),
  getPrevAndNext: (asPath: string) => {
    const currentPageIndex = get().currentDocs.findIndex((item) => item.url === asPath)
    const previousPage = currentPageIndex > 0 && get().currentDocs[currentPageIndex - 1]
    const nextPage =
      currentPageIndex < get().currentDocs.length - 1 && get().currentDocs[currentPageIndex + 1]
    return {
      previousPage,
      nextPage,
      currentPageIndex,
    }
  },
  setCurrentDocs: (folder: string) =>
    set((state) => {
      const currentDocs = state.docs.filter((doc) => doc.url.includes(`/${folder}/`))
      return { currentDocs }
    }),
}))
