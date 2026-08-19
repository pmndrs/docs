// PROTOTYPE — throwaway. See browse.prototype.tsx.
//
// Ink 7.1.1's `useInput` handler is stale: it keeps the values from the first
// render, however many times the component re-renders after it. Reproduced in
// twenty lines — a counter ticking on an interval, logged from the handler,
// still reads 0 after twenty-four renders. So anything a key handler needs is
// read through this ref instead of through the closure.

import { useRef } from 'react'

export function useLatest<T>(value: T) {
  const ref = useRef(value)
  ref.current = value
  return ref
}
