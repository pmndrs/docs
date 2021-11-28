import { createRef, RefObject } from 'react'
import create from 'zustand'

export type SwitcherModal = {
  key: number
  opacity: number
}

export const switcherModalRef = createRef<RefObject<SwitcherModal>>()

export type SwitcherState = {
  isSwitcherOpen: boolean
  setIsSwitcherOpen: (isSwitcherOpen: boolean) => void
  openSwitcher: () => void
  closeSwitcher: () => void
  toggleSwitcher: () => void
}

const useSwitcher = create<SwitcherState>((set) => ({
  isSwitcherOpen: false,
  setIsSwitcherOpen: (isSwitcherOpen) => set({ isSwitcherOpen }),
  openSwitcher: () => set({ isSwitcherOpen: true }),
  closeSwitcher: () => set({ isSwitcherOpen: false }),
  toggleSwitcher: () => set((state) => ({ isSwitcherOpen: !state.isSwitcherOpen })),
}))

export default useSwitcher
