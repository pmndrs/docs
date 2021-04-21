import create from 'zustand'

type State = {
  isMenuOpen: boolean
  openMenu: () => void
  closeMenu: () => void
  toggleMenu: () => void
}

export const useMenu = create<State>((set) => ({
  isMenuOpen: false,
  openMenu: () => set({ isMenuOpen: true }),
  closeMenu: () => set({ isMenuOpen: false }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
}))
