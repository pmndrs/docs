import { useLayoutEffect, useEffect } from 'react'

// Conditionally run on the client (useEffect is no-op server-side)
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function useLockBodyScroll(active = false) {
  useIsomorphicLayoutEffect(() => {
    if (!active) return
    // Get original body overflow
    const originalStyle = window.getComputedStyle(document.body).overflow
    // Prevent scrolling on mount
    document.body.style.overflow = 'hidden'
    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [active])
}

export default useLockBodyScroll
