import { createRef } from 'react'
import create from 'zustand'

type State = {
  isSwitcherOpen: boolean
  setIsSwitcherOpen: (boolean) => void
  openSwitcher: () => void
  closeSwitcher: () => void
  toggleSwitcher: () => void
}

export const useSwitcher = create<State>((set) => ({
  isSwitcherOpen: false,
  setIsSwitcherOpen: (isSwitcherOpen) => set({ isSwitcherOpen }),
  openSwitcher: () => set({ isSwitcherOpen: true }),
  closeSwitcher: () => set({ isSwitcherOpen: false }),
  toggleSwitcher: () => set((state) => ({ isSwitcherOpen: !state.isSwitcherOpen })),
}))

export const switcherContentRef = createRef()
export const switcherModalRef = createRef()
