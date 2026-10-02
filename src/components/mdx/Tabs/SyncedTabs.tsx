'use client'

import { Tabs as UiTabs } from '@/components/ui/tabs'
import { useStoredChoice } from '@/hooks/useStoredChoice'
import { useState, type ComponentProps } from 'react'

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
 * another one: the pick is stored in localStorage, under `pmndrs-docs:tabs:<syncKey>` (see
 * `useStoredChoice`), and reaches the other `Tabs` of this page and of other browser tabs — those
 * of this page even when localStorage is unavailable.
 *
 * `defaultValue` on the server and at hydration, for the HTML to match: the stored pick right
 * after. A client-side navigation shows the stored pick directly. A pick it has no tab for, e.g.
 * Vue where only React and Svelte are, leaves it on the tab it shows, and stays stored for the
 * next `Tabs` that has it.
 *
 * Only this root is a client component: the panels in it are still rendered on the server.
 */
export function SyncedTabs({ syncKey, defaultValue, values, ...props }: SyncedTabsProps) {
  const [picked, setPicked] = useStoredChoice(`pmndrs-docs:tabs:${syncKey}`)
  const [shown, setShown] = useState(() =>
    picked !== null && values.includes(picked) ? picked : defaultValue,
  )

  // Follows a new pick only: the one stored, once hydrated, or one made in any `Tabs` of the same
  // `syncKey`
  const [lastPicked, setLastPicked] = useState(picked)
  if (picked !== lastPicked) {
    setLastPicked(picked)
    // A pick it has no tab for leaves it on the tab it shows
    if (picked !== null && values.includes(picked)) setShown(picked)
  }

  function pick(value: unknown) {
    if (typeof value !== 'string') return
    setShown(value)
    setPicked(value)
  }

  return <UiTabs {...props} value={shown} onValueChange={pick} />
}
