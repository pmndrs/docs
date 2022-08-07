import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

export function useLockBodyScroll(active = false) {
  useIsomorphicLayoutEffect(() => {
    if (!active) return
    // Get original body overflow
    const originalStyle = window.getComputedStyle(document.body).overflow
    // Prevent scrolling on mount
    document.body.style.overflow = 'hidden'
    // Re-enable scrolling when component unmounts
    return () => void (document.body.style.overflow = originalStyle)
  }, [active])
}
