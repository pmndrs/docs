'use client'

import { useState } from 'react'

type ExampleProps = {
  /** Starting value supplied by the MDX scope. */
  initialCount: number
}

/**
 * A documentation example registered through the repository's docs.config.ts.
 */
export function Example({ initialCount }: ExampleProps) {
  const [count, setCount] = useState(initialCount)

  return (
    <button
      type="button"
      className="rounded border px-3 py-2"
      data-testid="custom-component-example"
      data-count={count}
      onClick={() => setCount(count + 1)}
    >
      Count: {count}
    </button>
  )
}
