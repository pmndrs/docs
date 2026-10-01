import { useEffect, useState } from 'react'

/**
 * Whether something was just copied, falling back to `false` 2s later.
 */
export function useCopied() {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  return [copied, setCopied] as const
}
