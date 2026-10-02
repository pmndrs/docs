'use client'

import { useEffect, useState, type RefObject } from 'react'

/**
 * Whether the stream should be open: only while the component is on screen AND its tab is
 * visible. Every reader of a page embedding `<McpLive>` would otherwise hold a connection open --
 * scrolled past it, or in a tab left in the background.
 */

/** What `watchStreamGate` needs from the browser, injectable so it can be tested without one. */
export interface GateEnvironment {
  document: Pick<Document, 'visibilityState' | 'addEventListener' | 'removeEventListener'>
  IntersectionObserver?: new (
    callback: (entries: Pick<IntersectionObserverEntry, 'isIntersecting'>[]) => void,
  ) => Pick<IntersectionObserver, 'observe' | 'disconnect'>
}

/**
 * How long the gate stays open once the component is scrolled away or its tab hidden: scrolling
 * past it, or switching tabs for a moment, should not cost a reconnection.
 */
export const CLOSE_DELAY_MS = 5_000

function browserEnvironment(): GateEnvironment {
  return {
    document,
    IntersectionObserver:
      typeof IntersectionObserver === 'undefined' ? undefined : IntersectionObserver,
  }
}

/**
 * Calls `onChange` with the gate's state whenever it changes, starting with the first one known:
 * open as soon as the element is in view in a visible tab, closed `closeDelayMs` after it no
 * longer is. Returns the function that stops watching.
 */
export function watchStreamGate(
  element: Element,
  onChange: (open: boolean) => void,
  {
    closeDelayMs = CLOSE_DELAY_MS,
    environment = browserEnvironment(),
  }: { closeDelayMs?: number; environment?: GateEnvironment } = {},
): () => void {
  // Without an IntersectionObserver there is no telling, so the element counts as in view
  let inView = environment.IntersectionObserver === undefined
  let visible = environment.document.visibilityState === 'visible'
  let open: boolean | undefined
  let closing: ReturnType<typeof setTimeout> | undefined

  const emit = (next: boolean) => {
    if (next !== open) {
      open = next
      onChange(next)
    }
  }

  const update = () => {
    if (inView && visible) {
      clearTimeout(closing)
      closing = undefined
      emit(true)
    } else if (!open || closeDelayMs === 0) {
      emit(false)
    } else if (closing === undefined) {
      closing = setTimeout(() => {
        closing = undefined
        emit(false)
      }, closeDelayMs)
    }
  }

  const onVisibilityChange = () => {
    visible = environment.document.visibilityState === 'visible'
    update()
  }
  environment.document.addEventListener('visibilitychange', onVisibilityChange)

  const observer = environment.IntersectionObserver
    ? new environment.IntersectionObserver((entries) => {
        inView = entries.some((entry) => entry.isIntersecting)
        update()
      })
    : undefined
  observer?.observe(element)

  update()

  return () => {
    clearTimeout(closing)
    environment.document.removeEventListener('visibilitychange', onVisibilityChange)
    observer?.disconnect()
  }
}

export function useStreamGate(ref: RefObject<Element | null>) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    return watchStreamGate(element, setOpen)
  }, [ref])
  return open
}
