import create from 'zustand'
import type { Doc } from 'utils/docs'

export type DocState = {
  docs: Doc[]
  setDocs: (doc: Doc[]) => void
  getPrevAndNext: (asPath: string) => {
    previousPage: Doc
    nextPage: Doc
    currentPageIndex: number
  }
}

const useDocs = create<DocState>((set, get) => ({
  docs: [],
  currentDocs: [],
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

export default useDocs
