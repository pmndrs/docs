// https://sandpack.codesandbox.io/docs/guides/ssr#nextjs-app-dir

'use client'

import { getSandpackCssText } from '@codesandbox/sandpack-react'
import { useServerInsertedHTML } from 'next/navigation'
import { useRef } from 'react'

/**
 * Ensures CSSinJS styles are loaded server side.
 */
export const SandpackCSS = () => {
  // Next calls this back on every flush of the streamed response, expecting whatever is new
  // since the last one. Sandpack's stylesheet is built when the module loads and never grows
  // after that, so everything it has to give is already there on the first call — and every
  // later call would repeat all of it. A page streamed in 141 chunks carried 145 identical
  // copies of the same 8.9 kB, three quarters of its weight.
  const inserted = useRef(false)

  useServerInsertedHTML(() => {
    if (inserted.current) return null
    inserted.current = true

    return <style dangerouslySetInnerHTML={{ __html: getSandpackCssText() }} id="sandpack" />
  })
  return null
}
