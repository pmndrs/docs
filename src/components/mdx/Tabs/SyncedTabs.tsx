'use client'

import { Tabs as UiTabs } from '@/components/ui/tabs'
import { useStoredChoice } from '@/hooks/useStoredChoice'
import { useEffect, useRef, useState, useSyncExternalStore, type ComponentProps } from 'react'

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

  // Rendered on the server, its stored pick shown right after hydration: in the same render as
  // `hydrating` turns `false`. That switch changes the height of the panel shown after the browser
  // scrolled to the `#hash`, and a target below this `Tabs` would end out of view: scrolled to
  // again. Once, never for a later pick: one made elsewhere on the page doesn't move the reader.
  const root = useRef<HTMLDivElement>(null)
  const hydrating = useHydrating()
  const [serverRendered] = useState(hydrating)
  const hydrated = useRef(false)
  useEffect(() => {
    if (!serverRendered || hydrating || hydrated.current) return
    hydrated.current = true
    if (shown === defaultValue || !location.hash || !root.current) return
    return whenPanelsSettle(root.current, scrollToHash)
  }, [serverRendered, hydrating, shown, defaultValue])

  function pick(value: unknown) {
    if (typeof value !== 'string') return
    setShown(value)
    setPicked(value)
  }

  return <UiTabs {...props} ref={root} value={shown} onValueChange={pick} />
}

/**
 * `true` while rendering on the server and hydrating, `false` once hydrated, and on a client-side
 * navigation.
 */
function useHydrating() {
  return useSyncExternalStore(
    () => () => {},
    () => false,
    () => true,
  )
}

/**
 * Calls `callback` once the panel left is hidden too, only the one shown remaining: Base UI hides
 * it once its exit animation is over, a frame or more after the switch. Returns a cleanup.
 */
function whenPanelsSettle(root: HTMLElement, callback: () => void) {
  // Its own panels, not those of a nested `Tabs`
  const settled = () =>
    Array.from(root.querySelectorAll<HTMLElement>('[role="tabpanel"]')).filter(
      (panel) => panel.closest('[data-slot="tabs"]') === root && !panel.hidden,
    ).length <= 1

  if (settled()) {
    callback()
    return
  }

  const observer = new MutationObserver(() => {
    if (!settled()) return
    observer.disconnect()
    callback()
  })
  observer.observe(root, { subtree: true, attributes: true, attributeFilter: ['hidden'] })
  return () => observer.disconnect()
}

/**
 * Scrolls to the element the `#hash` of this page points to, as `TabsAnchor` does. Nothing for an
 * element in a hidden panel: `TabsAnchor` opens it and scrolls to it, a frame later.
 */
function scrollToHash() {
  let id: string
  try {
    id = decodeURIComponent(location.hash.slice(1))
  } catch {
    return // a malformed hash, e.g. `#%`, points to nothing
  }
  if (id) document.getElementById(id)?.scrollIntoView()
}
