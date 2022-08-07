import create from 'zustand'

export interface MenuState {
  isMenuOpen: boolean
  openMenu: () => void
  closeMenu: () => void
  toggleMenu: () => void
}

export const useMenu = create<MenuState>((set) => ({
  isMenuOpen: false,
  openMenu: () => set({ isMenuOpen: true }),
  closeMenu: () => set({ isMenuOpen: false }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
}))
