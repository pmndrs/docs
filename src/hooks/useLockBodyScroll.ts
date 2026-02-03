import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

export function useLockBodyScroll(active = false) {
  useIsomorphicLayoutEffect(() => {
    const outer = document.createElement('div')
    outer.style.visibility = 'hidden'
    outer.style.overflow = 'scroll'
    document.body.appendChild(outer)

    const inner = document.createElement('div')
    outer.appendChild(inner)

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth
    document.body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)

    document.body.removeChild(outer)
  }, [])

  useIsomorphicLayoutEffect(() => {
    if (!active) return

    const onResize = () => {
      // Hide the scrollbar
      document.body.style.overflow = 'hidden'

      // Offset the page by scrollbar width to prevent CLS
      const scrollbarVisible = document.body.scrollHeight <= document.body.clientHeight
      document.body.style.paddingRight = scrollbarVisible ? 'var(--scrollbar-width)' : '0px'
    }

    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(document.body)
    onResize()

    // Unset style overrides on unmount
    return () => {
      resizeObserver.disconnect()
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = 'unset'
    }
  }, [active])
}
