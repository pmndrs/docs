'use client'

import { Tabs as UiTabs } from '@/components/ui/tabs'
import { useState, type ComponentProps } from 'react'
import { useLocalStorage } from 'usehooks-ts'

// The pick, stored as the raw string, not JSON. Out of the component: `useLocalStorage` has its
// options in the deps of its callbacks, which a new object each render would recreate.
const RAW_STRING = {
  // `defaultValue` first, for the server HTML and hydration to match: the stored pick is read in
  // an effect after
  initializeWithValue: false,
  serializer: (value: string) => value,
  deserializer: (value: string) => value,
}

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
 * another one: the pick is stored in localStorage, under `pmndrs-docs:tabs:<syncKey>`, by
 * usehooks-ts' `useLocalStorage`, which also brings it to the other `Tabs` of this page and of
 * other browser tabs.
 *
 * `defaultValue` on the server and at hydration, for the HTML to match: the stored pick once
 * hydrated. A pick it has no tab for, e.g. Vue where only React and Svelte are, leaves it on the
 * tab it shows, and stays stored for the next `Tabs` that has it.
 *
 * Without localStorage, a pick still switches the `Tabs` it is made in, but not the others: the
 * hook only tells them once the pick is stored.
 *
 * Only this root is a client component: the panels in it are still rendered on the server.
 */
export function SyncedTabs({ syncKey, defaultValue, values, ...props }: SyncedTabsProps) {
  const [picked, setPicked] = useLocalStorage(
    `pmndrs-docs:tabs:${syncKey}`,
    defaultValue,
    RAW_STRING,
  )
  const [shown, setShown] = useState(defaultValue)

  // Follows a new pick only, not the stored one: when it couldn't be stored, the tab clicked here
  // stays shown, instead of going back to the previous pick
  const [lastPicked, setLastPicked] = useState(picked)
  if (picked !== lastPicked) {
    setLastPicked(picked)
    // A pick it has no tab for leaves it on the tab it shows
    if (values.includes(picked)) setShown(picked)
  }

  function pick(value: unknown) {
    if (typeof value !== 'string') return
    setShown(value) // Even when localStorage is unavailable
    setPicked(value)
  }

  return <UiTabs {...props} value={shown} onValueChange={pick} />
}
