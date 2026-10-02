'use client'

import { Tabs as UiTabs } from '@/components/ui/tabs'
import { useEffect, useState, type ComponentProps } from 'react'

// A pick, for the other `SyncedTabs` of this page: the `storage` event only reaches other browser
// tabs, and none fires when localStorage is unavailable
const PICK_EVENT = 'pmndrs-docs:tabs'

type PickDetail = { key: string; value: string }

type SyncedTabsProps = Omit<
  ComponentProps<typeof UiTabs>,
  'value' | 'defaultValue' | 'onValueChange'
> & {
  syncKey: string
  defaultValue: string
  /** The `value` of each of its `TabsTrigger`s, as the server `Tabs` finds them in its children */
  values: string[]
}

/**
 * The ui `Tabs`, showing the tab picked last in any `Tabs` of the same `syncKey`, on this page or
 * another one: the pick is stored in localStorage, under `pmndrs-docs:tabs:<syncKey>`.
 *
 * `defaultValue` on the server and at hydration, for the HTML to match: the stored pick once
 * hydrated. A pick it has no tab for, e.g. Vue where only React and Svelte are, leaves it on the
 * tab it shows, and stays stored for the next `Tabs` that has it.
 *
 * Only this root is a client component: the panels in it are still rendered on the server.
 */
export function SyncedTabs({ syncKey, defaultValue, values, ...props }: SyncedTabsProps) {
  const key = `pmndrs-docs:tabs:${syncKey}`
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    function show(picked: string | null) {
      if (picked !== null && values.includes(picked)) setValue(picked)
    }

    // A pick on this page, in this `Tabs` too
    function onPick(event: Event) {
      const pick = (event as CustomEvent<PickDetail>).detail
      if (pick.key === key) show(pick.value)
    }

    // A pick made in another tab
    function onStorage(event: StorageEvent) {
      if (event.key === key) show(event.newValue)
    }

    try {
      show(localStorage.getItem(key))
    } catch {
      // localStorage unavailable
    }
    window.addEventListener(PICK_EVENT, onPick)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(PICK_EVENT, onPick)
      window.removeEventListener('storage', onStorage)
    }
  }, [key, values])

  function pick(picked: unknown) {
    if (typeof picked !== 'string') return
    try {
      localStorage.setItem(key, picked)
    } catch {
      // localStorage unavailable: still the same pick on this page, only not remembered
    }
    window.dispatchEvent(
      new CustomEvent<PickDetail>(PICK_EVENT, { detail: { key, value: picked } }),
    )
  }

  return <UiTabs {...props} value={value} onValueChange={pick} />
}
