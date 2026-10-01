'use client'

import { useEffect, useRef } from 'react'

/**
 * Opens the tab panel(s) hiding the element the URL's `#hash` points to, if it is in the Tabs
 * this is rendered in, e.g. a heading in a `TabsContent` that is not shown.
 *
 * Renders an empty, hidden `<span>`, only to find that Tabs: its parent element.
 *
 * Clicks the tab of each hidden panel, outermost first (Tabs can be nested): the Tabs stay
 * uncontrolled. Then scrolls to the element, which the browser could not do while it was hidden.
 */
export function TabsAnchor() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    function reveal() {
      const tabs = ref.current?.parentElement
      if (!tabs || !location.hash) return

      let id: string
      try {
        id = decodeURIComponent(location.hash.slice(1))
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

    // A frame later: the tabs only get their `aria-controls` once the panels have registered
    const frame = requestAnimationFrame(reveal)
    window.addEventListener('hashchange', reveal)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('hashchange', reveal)
    }
  }, [])

  return <span ref={ref} hidden />
}
