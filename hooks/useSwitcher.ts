import create from 'zustand'

export interface SwitcherModal {
  key: number
  opacity: number
}

export interface SwitcherState {
  isSwitcherOpen: boolean
  setIsSwitcherOpen: (isSwitcherOpen: boolean) => void
  openSwitcher: () => void
  closeSwitcher: () => void
  toggleSwitcher: () => void
}

export const useSwitcher = create<SwitcherState>((set) => ({
  isSwitcherOpen: false,
  setIsSwitcherOpen: (isSwitcherOpen) => set({ isSwitcherOpen }),
  openSwitcher: () => set({ isSwitcherOpen: true }),
  closeSwitcher: () => set({ isSwitcherOpen: false }),
  toggleSwitcher: () => set((state) => ({ isSwitcherOpen: !state.isSwitcherOpen })),
}))
