import create from 'zustand'

export type Doc = { content: string; title: string; url: string; description: string }

export type DocState = {
  docs: Doc[]
  currentDocs: Doc[]
  setDocs: (doc: Doc[]) => void
  setCurrentDocs: (lib: string) => void
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
  setCurrentDocs: (lib: string) =>
    set((state) => {
      const currentDocs = state.docs.filter((doc) => doc.url.includes(`/${lib}/`))
      return { currentDocs }
    }),
}))

export default useDocs
