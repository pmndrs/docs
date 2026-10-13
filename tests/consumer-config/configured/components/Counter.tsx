'use client'

import { useState } from 'react'

/**
 * Proves that a consumer client component receives scope data and hydrates.
 */
export function Counter({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount)

  return (
    <button data-testid="consumer-counter" data-count={count} onClick={() => setCount(count + 1)}>
      Increment: {count}
    </button>
  )
}
