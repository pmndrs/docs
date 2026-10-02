import { useSyncExternalStore } from 'react'

// A choice of the reader, per localStorage key: read from localStorage once, then kept here. It
// still reaches every subscriber of the page when localStorage is unavailable (blocked, private
// mode…), only without being remembered.
type Store = {
  /** `undefined` until read, `null` when nothing is stored */
  value: string | null | undefined
  listeners: Set<() => void>
  // Created once per key: stable, so React doesn't resubscribe on every render
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => string | null
  set: (value: string) => void
}

const stores = new Map<string, Store>()

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    // localStorage unavailable
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage unavailable
  }
}

function notify(store: Store) {
  for (const listener of store.listeners) listener()
}

// Another tab changed it: one window listener for every key, added with the first subscriber and
// then kept, so that a cached choice never misses a change while no component shows it. A `null`
// key is a `localStorage.clear()`.
let listening = false

function onStorage(event: StorageEvent) {
  for (const [key, store] of stores) {
    if (event.key !== null && event.key !== key) continue
    store.value = readStorage(key)
    notify(store)
  }
}

function storeOf(key: string): Store {
  let store = stores.get(key)
  if (store) return store

  const created: Store = {
    value: undefined,
    listeners: new Set(),
    subscribe(listener) {
      if (!listening) {
        window.addEventListener('storage', onStorage)
        listening = true
      }
      created.listeners.add(listener)
      return () => {
        created.listeners.delete(listener)
      }
    },
    getSnapshot() {
      if (created.value === undefined) created.value = readStorage(key)
      return created.value
    },
    set(value) {
      created.value = value
      writeStorage(key, value)
      notify(created)
    },
  }
  stores.set(key, created)
  return created
}

// Nothing stored on the server: hydration renders what the server did
function getServerSnapshot() {
  return null
}

/**
 * A choice the reader made, stored in localStorage under `key`: the same for every component of
 * the page using that `key`, remembered across pages, reloads and tabs.
 *
 * `null` when nothing is stored, and on the server and at hydration, for the HTML to match: the
 * stored choice right after. A client-side navigation renders the stored choice directly.
 *
 * Any string: the caller falls back to its default, and checks the value is one it has.
 */
export function useStoredChoice(key: string) {
  const store = storeOf(key)
  const stored = useSyncExternalStore(store.subscribe, store.getSnapshot, getServerSnapshot)
  return [stored, store.set] as const
}
