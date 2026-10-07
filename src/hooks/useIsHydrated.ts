import { useSyncExternalStore } from 'react'

function subscribe() {
  return () => {}
}

/**
 * `false` while rendering on the server and hydrating, `true` right after: to render what the
 * server did until the client takes over.
 */
export function useIsHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
