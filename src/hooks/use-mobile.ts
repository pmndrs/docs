import * as React from 'react'

// The site's `lg` (1024px), not shadcn's 768: the desktop nav and the TOC grid switch at `lg`. The
// `md:` classes in `ui/sidebar.tsx` were moved to `lg:` to match, so the server-rendered desktop
// sidebar and this hook agree. Keep both in step after a `shadcn add sidebar --overwrite`.
const MOBILE_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}
