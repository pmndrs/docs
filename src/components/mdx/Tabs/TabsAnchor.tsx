'use client'

import { useEffect, useRef } from 'react'

/**
 * Opens the tab panel(s) hiding the element a `#hash` of this page points to, if it is in the
 * Tabs this is rendered in, e.g. a heading in a `TabsContent` that is not shown.
 *
 * Renders an empty, hidden `<span>`, only to find that Tabs: its parent element.
 *
 * Clicks the tab of each hidden panel, outermost first (Tabs can be nested): the Tabs stay
 * uncontrolled. Then scrolls to the element, which the browser could not do while it was hidden.
 */
export function TabsAnchor() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    // Harmless when called twice for one navigation: the second time, no panel is hidden anymore
    function reveal(hash: string) {
      const tabs = ref.current?.parentElement
      if (!tabs || !hash) return

      let id: string
      try {
        id = decodeURIComponent(hash.slice(1))
      } catch {
        return // a malformed hash, e.g. `#%`, points to nothing
      }

      const target = document.getElementById(id)
      if (!target || !tabs.contains(target)) return

      // The hidden panels around the target, innermost first
      const hiddenPanels: HTMLElement[] = []
      let panel = target.closest<HTMLElement>('[role="tabpanel"]')
      while (panel && tabs.contains(panel)) {
        if (panel.hidden) hiddenPanels.push(panel)
        panel = panel.parentElement?.closest<HTMLElement>('[role="tabpanel"]') ?? null
      }

      let activated = false
      for (const panel of hiddenPanels.reverse()) {
        const tab = tabs.querySelector<HTMLElement>(
          `[role="tab"][aria-controls="${CSS.escape(panel.id)}"]`,
        )
        if (tab) {
          tab.click()
          activated = true
        }
      }

      // Once the panel is shown
      if (activated) requestAnimationFrame(() => target.scrollIntoView())
    }

    // Back/forward, a URL typed in
    function onHashChange() {
      reveal(location.hash)
    }

    // A link to a `#hash` of this page. No `hashchange` for a Next `<Link>` (e.g. a search result,
    // which changes the URL with `history.pushState`), nor for the hash the URL already has.
    // Next's `<Link>` calls `preventDefault()` itself: a prevented click still counts.
    function onClick(event: MouseEvent) {
      // Opens a new tab or window instead
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      const link = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!(link instanceof HTMLAnchorElement)) return

      const url = new URL(link.href)
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return

      reveal(url.hash)
    }

    // Any change of the URL, `history.pushState` included, e.g. Next's `router.push` of a search
    // result picked with the keyboard: no link is clicked. The Navigation API, not in TypeScript's
    // DOM types yet, nor in every browser: the listeners above are the fallback.
    const navigation = (window as { navigation?: EventTarget }).navigation

    // A frame later: the tabs only get their `aria-controls` once the panels have registered
    const frame = requestAnimationFrame(() => reveal(location.hash))
    window.addEventListener('hashchange', onHashChange)
    document.addEventListener('click', onClick)
    navigation?.addEventListener('currententrychange', onHashChange)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('hashchange', onHashChange)
      document.removeEventListener('click', onClick)
      navigation?.removeEventListener('currententrychange', onHashChange)
    }
  }, [])

  return <span ref={ref} hidden />
}
